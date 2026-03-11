import csv
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import PermissionMixin
from financial.models import Account, Currency, CurrencyRate, Expense, FinancialTransaction, PartnerDebt, Salary
from inventory.models import InventoryTransaction, TankStorage
from purchasing.models import Purchase
from sales.models import Lending, Sale

from .serializers import (
    AccountBalanceReportRowSerializer,
    DailySeriesPointSerializer,
    OutstandingLendingRowSerializer,
    PurchaseSummaryRowSerializer,
    TankStockReportRowSerializer,
)


def _decimal_value(value=Decimal('0.00')):
    return Value(value, output_field=DecimalField(max_digits=18, decimal_places=2))


def _parse_date(value):
    if not value:
        return None
    return timezone.datetime.strptime(value, '%Y-%m-%d').date()


def _apply_date_range(queryset, field_name, date_from, date_to):
    if date_from is not None:
        queryset = queryset.filter(**{f'{field_name}__gte': date_from})
    if date_to is not None:
        queryset = queryset.filter(**{f'{field_name}__lte': date_to})
    return queryset


def _get_filters(request):
    return {
        'date_from': _parse_date(request.query_params.get('date_from')),
        'date_to': _parse_date(request.query_params.get('date_to')),
        'fuel_id': request.query_params.get('fuel_id'),
        'tank_id': request.query_params.get('tank_id'),
        'currency_id': request.query_params.get('currency_id'),
        'account_id': request.query_params.get('account_id'),
        'supplier_id': request.query_params.get('supplier_id'),
        'customer_id': request.query_params.get('customer_id'),
    }


def _as_int(value):
    return int(value) if value not in (None, '') else None


def _get_base_currency():
    return Currency.objects.filter(is_base=True).first()


def _latest_rate_to_base(currency, base_currency):
    if base_currency is None or currency.id == base_currency.id:
        return Decimal('1.000000')

    direct_rate = (
        CurrencyRate.objects.filter(from_currency=currency, to_currency=base_currency).order_by('-date', '-id').first()
    )
    if direct_rate is not None:
        return direct_rate.rate_value

    inverse_rate = (
        CurrencyRate.objects.filter(from_currency=base_currency, to_currency=currency).order_by('-date', '-id').first()
    )
    if inverse_rate is not None and inverse_rate.rate_value:
        return (Decimal('1.000000') / inverse_rate.rate_value).quantize(Decimal('0.000001'))

    return Decimal('0.000000')


def _signed_quantity_value(transaction):
    incoming_types = {'purchase_in', 'return_in'}
    outgoing_types = {'sale_out', 'lending_out'}
    quantity = Decimal(transaction.quantity)

    if transaction.transaction_type in incoming_types:
        return quantity
    if transaction.transaction_type in outgoing_types:
        return -quantity
    if transaction.transaction_type == 'adjustment':
        if transaction.adjustment_direction == 'in':
            return quantity
        if transaction.adjustment_direction == 'out':
            return -quantity
    return Decimal('0.00')


def get_tank_stock_data(filters):
    fuel_id = _as_int(filters['fuel_id'])
    tank_id = _as_int(filters['tank_id'])
    date_from = filters['date_from']
    date_to = filters['date_to']

    tanks = TankStorage.objects.select_related('Fuel').all().order_by('tank_number', 'id')
    if fuel_id is not None:
        tanks = tanks.filter(Fuel_id=fuel_id)
    if tank_id is not None:
        tanks = tanks.filter(id=tank_id)

    transactions = InventoryTransaction.objects.all().select_related('tank_id')
    if fuel_id is not None:
        transactions = transactions.filter(fuel_id_id=fuel_id)
    if tank_id is not None:
        transactions = transactions.filter(tank_id_id=tank_id)
    if date_from is not None:
        transactions = transactions.filter(date_time__date__gte=date_from)
    if date_to is not None:
        transactions = transactions.filter(date_time__date__lte=date_to)

    totals = {}
    for transaction in transactions:
        totals.setdefault(transaction.tank_id_id, Decimal('0.00'))
        totals[transaction.tank_id_id] += _signed_quantity_value(transaction)

    rows = []
    total_current = Decimal('0.00')
    low_stock_count = 0
    for tank in tanks:
        current_liters = totals.get(tank.id, Decimal('0.00')).quantize(Decimal('0.01'))
        remaining_capacity = (tank.capacity - current_liters).quantize(Decimal('0.01'))
        low_stock = current_liters <= Decimal(str(tank.min_level_alert))
        if low_stock:
            low_stock_count += 1
        total_current += current_liters
        rows.append(
            {
                'tank_id': tank.id,
                'tank_number': tank.tank_number,
                'fuel_id': tank.Fuel_id,
                'fuel_name': str(tank.Fuel),
                'capacity': tank.capacity,
                'current_liters': current_liters,
                'remaining_capacity': remaining_capacity,
                'min_level_alert': tank.min_level_alert,
                'low_stock': low_stock,
            }
        )

    return {
        'summary': {
            'tank_count': len(rows),
            'total_current_liters': total_current.quantize(Decimal('0.01')),
            'low_stock_count': low_stock_count,
        },
        'rows': rows,
    }


def get_account_balance_data(filters):
    account_id = _as_int(filters['account_id'])
    currency_id = _as_int(filters['currency_id'])
    as_of = filters['date_to'] or timezone.localdate()
    base_currency = _get_base_currency()

    accounts = Account.objects.select_related('currency').filter(is_active=True).order_by('account_type', 'name', 'id')
    if account_id is not None:
        accounts = accounts.filter(id=account_id)
    if currency_id is not None:
        accounts = accounts.filter(currency_id=currency_id)

    transactions = FinancialTransaction.objects.select_related('currency').filter(date_time__date__lte=as_of)
    rows = []
    total_cash_base = Decimal('0.00')
    total_exchange_base = Decimal('0.00')
    currency_totals = {}

    for account in accounts:
        incoming = transactions.filter(
            Q(transaction_type=FinancialTransaction.TYPE_DEPOSIT, to_account=account)
            | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, to_account=account)
        ).aggregate(
            total=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            )
        )['total']
        outgoing = transactions.filter(
            Q(transaction_type=FinancialTransaction.TYPE_WITHDRAW, from_account=account)
            | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, from_account=account)
        ).aggregate(
            total=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            )
        )['total']
        native_balance = (incoming - outgoing).quantize(Decimal('0.01'))
        rate_to_base = _latest_rate_to_base(account.currency, base_currency)
        base_balance = (native_balance * rate_to_base).quantize(Decimal('0.01'))

        rows.append(
            {
                'account_id': account.id,
                'account_name': account.name,
                'account_type': account.account_type,
                'currency_id': account.currency_id,
                'currency_code': account.currency.code,
                'native_balance': native_balance,
                'base_balance': base_balance,
            }
        )

        if account.account_type == Account.TYPE_CASH:
            total_cash_base += base_balance
        else:
            total_exchange_base += base_balance

        currency_totals.setdefault(account.currency.code, Decimal('0.00'))
        currency_totals[account.currency.code] += native_balance

    return {
        'summary': {
            'as_of_date': as_of,
            'base_currency_code': base_currency.code if base_currency is not None else '',
            'total_cash_base': total_cash_base.quantize(Decimal('0.01')),
            'total_exchange_base': total_exchange_base.quantize(Decimal('0.01')),
            'currency_totals': [
                {'currency_code': code, 'native_balance': amount.quantize(Decimal('0.01'))}
                for code, amount in sorted(currency_totals.items())
            ],
        },
        'rows': rows,
    }


def get_sales_daily_data(filters):
    fuel_id = _as_int(filters['fuel_id'])
    tank_id = _as_int(filters['tank_id'])
    currency_id = _as_int(filters['currency_id'])
    queryset = Sale.objects.select_related('fuel', 'motor', 'motor__tank_id')
    queryset = _apply_date_range(queryset, 'sale_date', filters['date_from'], filters['date_to'])
    if fuel_id is not None:
        queryset = queryset.filter(fuel_id=fuel_id)
    if tank_id is not None:
        queryset = queryset.filter(motor__tank_id_id=tank_id)
    if currency_id is not None:
        queryset = queryset.filter(currency_id=currency_id)

    daily = list(
        queryset.values(date=F('sale_date'))
        .annotate(
            quantity=Coalesce(Sum('amount'), _decimal_value(), output_field=DecimalField(max_digits=18, decimal_places=2)),
            total_amount=Coalesce(Sum('total_amount_value'), _decimal_value(), output_field=DecimalField(max_digits=18, decimal_places=2)),
            total_amount_in_base_currency=Coalesce(
                Sum('total_amount_in_base_currency'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            count=Count('sale_id'),
        )
        .order_by('date')
    )

    summary = queryset.aggregate(
        count=Count('sale_id'),
        total_quantity=Coalesce(Sum('amount'), _decimal_value(), output_field=DecimalField(max_digits=18, decimal_places=2)),
        total_amount_in_base_currency=Coalesce(
            Sum('total_amount_in_base_currency'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )

    return {
        'summary': summary,
        'daily_series': daily,
    }


def _lending_queryset(filters):
    queryset = Lending.objects.select_related('customer', 'fuel', 'tank_id').all()
    queryset = _apply_date_range(queryset, 'sale_date', filters['date_from'], filters['date_to'])
    customer_id = _as_int(filters['customer_id'])
    fuel_id = _as_int(filters['fuel_id'])
    tank_id = _as_int(filters['tank_id'])
    if customer_id is not None:
        queryset = queryset.filter(customer_id=customer_id)
    if fuel_id is not None:
        queryset = queryset.filter(fuel_id=fuel_id)
    if tank_id is not None:
        queryset = queryset.filter(tank_id_id=tank_id)
    return queryset


def _serialize_lending_rows(queryset):
    rows = []
    for lending in queryset:
        rows.append(
            {
                'lending_id': lending.lending_id,
                'customer_name': lending.customer.full_name,
                'fuel_name': lending.fuel.fuel_name,
                'tank_name': f'Tank #{lending.tank_id.tank_number}' if lending.tank_id is not None else '',
                'sale_date': lending.sale_date,
                'end_date': lending.end_date,
                'total_amount': lending.total_amount_value,
                'paid_amount': lending.paid_amount,
                'remaining_amount': lending.remaining_amount_value,
                'status': lending.status,
            }
        )
    return rows


def get_outstanding_lending_data(filters):
    queryset = _lending_queryset(filters).filter(
        status__in=[Lending.STATUS_UNPAID, Lending.STATUS_PARTIAL, Lending.STATUS_OVERDUE]
    ).order_by('end_date', 'sale_date', 'lending_id')
    summary = queryset.aggregate(
        count=Count('lending_id'),
        total_remaining=Coalesce(
            Sum('remaining_amount_value'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    return {'summary': summary, 'rows': _serialize_lending_rows(queryset)}


def get_due_soon_lending_data(filters):
    today = timezone.localdate()
    due_date = today + timedelta(days=7)
    queryset = _lending_queryset(filters).filter(
        end_date__gte=today,
        end_date__lte=due_date,
        remaining_amount_value__gt=Decimal('0.00'),
    ).order_by('end_date', 'lending_id')
    summary = queryset.aggregate(
        count=Count('lending_id'),
        total_remaining=Coalesce(
            Sum('remaining_amount_value'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    summary['window_start'] = today
    summary['window_end'] = due_date
    summary['overdue_count'] = _lending_queryset(filters).filter(
        end_date__lt=today,
        remaining_amount_value__gt=Decimal('0.00'),
    ).count()
    return {'summary': summary, 'rows': _serialize_lending_rows(queryset)}


def get_purchase_summary_data(filters):
    queryset = Purchase.objects.select_related('fuel', 'supplier', 'currency').all()
    queryset = _apply_date_range(queryset, 'purchase_date', filters['date_from'], filters['date_to'])
    fuel_id = _as_int(filters['fuel_id'])
    supplier_id = _as_int(filters['supplier_id'])
    currency_id = _as_int(filters['currency_id'])
    if fuel_id is not None:
        queryset = queryset.filter(fuel_id=fuel_id)
    if supplier_id is not None:
        queryset = queryset.filter(supplier_id=supplier_id)
    if currency_id is not None:
        queryset = queryset.filter(currency_id=currency_id)

    liters_expression = ExpressionWrapper(
        F('amount_ton') * Value(Decimal('1000.00')) / F('density'),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )
    daily = list(
        queryset.values(date=F('purchase_date'))
        .annotate(
            liters=Coalesce(Sum(liters_expression), _decimal_value(), output_field=DecimalField(max_digits=18, decimal_places=2)),
            total_amount_in_base_currency=Coalesce(
                Sum('total_amount_in_base_currency'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_paid_in_base_currency=Coalesce(
                Sum('paid_amount_in_base_currency_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_remaining_in_base_currency=Coalesce(
                Sum('remaining_amount_in_base_currency_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            count=Count('purchase_id'),
        )
        .order_by('date')
    )
    summary = queryset.aggregate(
        count=Count('purchase_id'),
        total_liters=Coalesce(Sum(liters_expression), _decimal_value(), output_field=DecimalField(max_digits=18, decimal_places=2)),
        total_amount_in_base_currency=Coalesce(
            Sum('total_amount_in_base_currency'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
        total_paid_in_base_currency=Coalesce(
            Sum('paid_amount_in_base_currency_value'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
        total_remaining_in_base_currency=Coalesce(
            Sum('remaining_amount_in_base_currency_value'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    return {'summary': summary, 'daily_series': daily}


def get_overview_data(filters):
    inventory_data = get_tank_stock_data(filters)
    finance_data = get_account_balance_data(filters)
    sales_data = get_sales_daily_data(filters)
    outstanding_data = get_outstanding_lending_data(filters)
    due_soon_data = get_due_soon_lending_data(filters)
    purchase_data = get_purchase_summary_data(filters)
    base_currency = _get_base_currency()

    expenses = Expense.objects.all()
    partner_debts = PartnerDebt.objects.all()
    salaries = Salary.objects.all()
    if filters['date_from'] is not None:
        expenses = expenses.filter(pay_date__gte=filters['date_from'])
        partner_debts = partner_debts.filter(date__gte=filters['date_from'])
        salaries = salaries.filter(pay_date__gte=filters['date_from'])
    if filters['date_to'] is not None:
        expenses = expenses.filter(pay_date__lte=filters['date_to'])
        partner_debts = partner_debts.filter(date__lte=filters['date_to'])
        salaries = salaries.filter(pay_date__lte=filters['date_to'])

    expense_summary = expenses.aggregate(
        count=Count('id'),
        total_amount_in_base_currency=Coalesce(
            Sum('amount_in_base_currency'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    partner_debt_summary = partner_debts.aggregate(
        count=Count('id'),
        total_outstanding=Coalesce(
            Sum(
                ExpressionWrapper(
                    F('total_in') - F('paid_amount'),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                )
            ),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    salary_summary = salaries.aggregate(
        count=Count('id'),
        total_net_salary=Coalesce(
            Sum('net_salary'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        ),
    )
    latest_rates = list(
        CurrencyRate.objects.select_related('from_currency', 'to_currency')
        .order_by('-date', '-id')[:5]
        .values('date', 'from_currency__code', 'to_currency__code', 'rate_value')
    )

    return {
        'inventory': inventory_data,
        'finance': finance_data,
        'sales': sales_data,
        'lendings': {'outstanding': outstanding_data, 'due_soon': due_soon_data},
        'purchases': purchase_data,
        'expenses': expense_summary,
        'partner_debts': {
            'count': partner_debt_summary['count'],
            'total_outstanding': partner_debt_summary['total_outstanding'],
            'base_currency_code': base_currency.code if base_currency is not None else '',
        },
        'salaries': salary_summary,
        'currency_rates': {
            'base_currency_code': base_currency.code if base_currency is not None else '',
            'latest': latest_rates,
        },
    }


class BaseReportView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'


class ReportsOverviewView(BaseReportView):
    def get(self, request):
        return Response(get_overview_data(_get_filters(request)))


class TankStockReportView(BaseReportView):
    def get(self, request):
        payload = get_tank_stock_data(_get_filters(request))
        payload['rows'] = TankStockReportRowSerializer(payload['rows'], many=True).data
        return Response(payload)


class AccountBalancesReportView(BaseReportView):
    def get(self, request):
        payload = get_account_balance_data(_get_filters(request))
        payload['rows'] = AccountBalanceReportRowSerializer(payload['rows'], many=True).data
        return Response(payload)


class SalesDailyReportView(BaseReportView):
    def get(self, request):
        payload = get_sales_daily_data(_get_filters(request))
        payload['daily_series'] = DailySeriesPointSerializer(payload['daily_series'], many=True).data
        return Response(payload)


class OutstandingLendingsReportView(BaseReportView):
    def get(self, request):
        payload = get_outstanding_lending_data(_get_filters(request))
        payload['rows'] = OutstandingLendingRowSerializer(payload['rows'], many=True).data
        return Response(payload)


class DueSoonLendingsReportView(BaseReportView):
    def get(self, request):
        payload = get_due_soon_lending_data(_get_filters(request))
        payload['rows'] = OutstandingLendingRowSerializer(payload['rows'], many=True).data
        return Response(payload)


class PurchaseSummaryReportView(BaseReportView):
    def get(self, request):
        payload = get_purchase_summary_data(_get_filters(request))
        payload['daily_series'] = PurchaseSummaryRowSerializer(payload['daily_series'], many=True).data
        return Response(payload)


class ReportCsvExportView(BaseReportView):
    REPORT_BUILDERS = {
        'inventory-stock': ('tank_stock_report.csv', lambda filters: get_tank_stock_data(filters)['rows']),
        'account-balances': ('account_balances_report.csv', lambda filters: get_account_balance_data(filters)['rows']),
        'sales-daily': ('sales_daily_report.csv', lambda filters: get_sales_daily_data(filters)['daily_series']),
        'lendings-outstanding': ('outstanding_lendings_report.csv', lambda filters: get_outstanding_lending_data(filters)['rows']),
        'lendings-due-soon': ('due_soon_lendings_report.csv', lambda filters: get_due_soon_lending_data(filters)['rows']),
        'purchases-summary': ('purchase_summary_report.csv', lambda filters: get_purchase_summary_data(filters)['daily_series']),
    }

    def get(self, request, report_key):
        report = self.REPORT_BUILDERS.get(report_key)
        if report is None:
            return Response({'detail': 'Unknown report key.'}, status=404)

        filename, builder = report
        rows = builder(_get_filters(request))
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        if not rows:
            writer.writerow(['message'])
            writer.writerow(['No data available'])
            return response

        fieldnames = list(rows[0].keys())
        writer.writerow(fieldnames)
        for row in rows:
            writer.writerow([row.get(field) for field in fieldnames])
        return response
