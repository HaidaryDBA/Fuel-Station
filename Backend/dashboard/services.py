from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Case, DecimalField, ExpressionWrapper, F, Q, Sum, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone

from financial.models import Account, Currency, FinancialTransaction
from inventory.models import InventoryTransaction
from sales.models import Sale


TWO_DECIMAL_PLACES = Decimal('0.01')


def _decimal_value(value=Decimal('0.00')):
    return Value(value, output_field=DecimalField(max_digits=18, decimal_places=2))


def _quantize(value):
    if value is None:
        return Decimal('0.00')
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return value.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


def _get_base_currency():
    return Currency.objects.filter(is_base=True).first()


def get_cash_and_exchange_balances(as_of_date=None):
    if as_of_date is None:
        as_of_date = timezone.localdate()

    accounts = (
        Account.objects.select_related('currency')
        .filter(is_active=True)
        .order_by('account_type', 'name', 'id')
    )
    transactions = FinancialTransaction.objects.filter(date_time__date__lte=as_of_date)

    cash_accounts = []
    exchange_accounts = []

    for account in accounts:
        incoming = (
            transactions.filter(
                Q(transaction_type=FinancialTransaction.TYPE_DEPOSIT, to_account=account)
                | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, to_account=account)
            )
            .aggregate(
                total=Coalesce(
                    Sum('amount'),
                    _decimal_value(),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                )
            )
            .get('total')
        )
        outgoing = (
            transactions.filter(
                Q(transaction_type=FinancialTransaction.TYPE_WITHDRAW, from_account=account)
                | Q(transaction_type=FinancialTransaction.TYPE_TRANSFER, from_account=account)
            )
            .aggregate(
                total=Coalesce(
                    Sum('amount'),
                    _decimal_value(),
                    output_field=DecimalField(max_digits=18, decimal_places=2),
                )
            )
            .get('total')
        )

        balance = _quantize(incoming - outgoing)
        payload = {
            'account_id': account.id,
            'account_name': account.name,
            'currency': account.currency.code,
            'balance': balance,
        }

        if account.account_type == Account.TYPE_CASH:
            cash_accounts.append(payload)
        else:
            exchange_accounts.append(payload)

    return {'cash_accounts': cash_accounts, 'exchange_accounts': exchange_accounts}


def get_fuel_inventory_totals():
    signed_quantity = Case(
        When(transaction_type__in=['purchase_in', 'return_in'], then=F('quantity')),
        When(
            transaction_type__in=['sale_out', 'lending_out'],
            then=ExpressionWrapper(-F('quantity'), output_field=DecimalField(max_digits=18, decimal_places=2)),
        ),
        When(transaction_type='adjustment', adjustment_direction='in', then=F('quantity')),
        When(
            transaction_type='adjustment',
            adjustment_direction='out',
            then=ExpressionWrapper(-F('quantity'), output_field=DecimalField(max_digits=18, decimal_places=2)),
        ),
        default=_decimal_value(),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )

    rows = (
        InventoryTransaction.objects.values('fuel_id', 'fuel_id__fuel_name', 'fuel_id__type')
        .annotate(
            liters=Coalesce(
                Sum(signed_quantity),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            )
        )
        .order_by('fuel_id__fuel_name', 'fuel_id__type')
    )

    results = []
    for row in rows:
        fuel_label = f"{row['fuel_id__fuel_name']} {row['fuel_id__type']}".strip()
        results.append(
            {
                'fuel_id': row['fuel_id'],
                'fuel': fuel_label,
                'liters': _quantize(row['liters']),
            }
        )

    return results


def get_today_sales_summary(today=None):
    if today is None:
        today = timezone.localdate()

    queryset = Sale.objects.filter(sale_date=today)

    total_liters = queryset.aggregate(
        total=Coalesce(
            Sum('amount'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        )
    ).get('total')

    total_amount_base = queryset.aggregate(
        total=Coalesce(
            Sum('total_amount_in_base_currency'),
            _decimal_value(),
            output_field=DecimalField(max_digits=18, decimal_places=2),
        )
    ).get('total')

    totals_by_currency = (
        queryset.values('currency__code')
        .annotate(
            amount=Coalesce(
                Sum('total_amount_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            )
        )
        .order_by('currency__code')
    )

    base_currency = _get_base_currency()

    return {
        'total_liters': _quantize(total_liters),
        'total_amount_base': _quantize(total_amount_base),
        'base_currency_code': base_currency.code if base_currency is not None else '',
        'total_amount_by_currency': [
            {'currency': row['currency__code'], 'amount': _quantize(row['amount'])}
            for row in totals_by_currency
        ],
    }
