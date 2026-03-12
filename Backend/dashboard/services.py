from decimal import Decimal, ROUND_HALF_UP

from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from financial.models import Account, Currency, FinancialTransaction
from inventory.models import InventoryTransaction, TankStorage
from sales.models import Sale


TWO_DECIMAL_PLACES = Decimal('0.01')
LITERS_PER_TON = Decimal('1000')


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


def get_today_sales_overview(today=None):
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


def get_tank_inventory_status():
    tanks = TankStorage.objects.select_related('Fuel').order_by('tank_number', 'Fuel__fuel_name', 'Fuel__type')
    transactions = InventoryTransaction.objects.select_related('tank_id').all()

    totals = {}
    for transaction in transactions:
        quantity = abs(Decimal(transaction.quantity or 0))
        totals.setdefault(transaction.tank_id_id, Decimal('0.00'))

        if transaction.transaction_type in ['purchase_in', 'return_in']:
            totals[transaction.tank_id_id] += quantity
        elif transaction.transaction_type in ['sale_out', 'lending_out']:
            totals[transaction.tank_id_id] -= quantity
        elif transaction.transaction_type == 'adjustment':
            if transaction.adjustment_direction == 'in':
                totals[transaction.tank_id_id] += quantity
            elif transaction.adjustment_direction == 'out':
                totals[transaction.tank_id_id] -= quantity

    results = []
    for tank in tanks:
        current_liters = _quantize(totals.get(tank.id, Decimal('0.00')))
        capacity_tons = _quantize(tank.capacity)
        capacity_liters = _quantize(Decimal(tank.capacity) * LITERS_PER_TON)
        current_tons = _quantize(Decimal(current_liters) / LITERS_PER_TON)
        min_level_alert_tons = _quantize(Decimal(tank.min_level_alert or 0))
        min_level_alert_liters = _quantize(Decimal(tank.min_level_alert or 0) * LITERS_PER_TON)

        results.append(
            {
                'tank_number': tank.tank_number,
                'fuel_type': f"{tank.Fuel.fuel_name} {tank.Fuel.type}".strip(),
                'capacity_tons': capacity_tons,
                'capacity_liters': capacity_liters,
                'current_liters': current_liters,
                'current_tons': current_tons,
                'min_level_alert_tons': min_level_alert_tons,
                'min_level_alert_liters': min_level_alert_liters,
                'is_below_min_level': current_liters <= min_level_alert_liters if min_level_alert_liters > 0 else False,
                'is_over_capacity': current_liters > capacity_liters if capacity_liters > 0 else False,
            }
        )
    return results


def get_today_sales_summary(today=None):
    if today is None:
        today = timezone.localdate()

    rows = (
        Sale.objects.filter(sale_date=today)
        .values('fuel_id', 'fuel__fuel_name', 'fuel__type')
        .annotate(
            liters_sold_today=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_amount_today=Coalesce(
                Sum('total_amount_in_base_currency'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )
        .order_by('fuel__fuel_name', 'fuel__type')
    )

    results = []
    for row in rows:
        fuel_label = f"{row['fuel__fuel_name']} {row['fuel__type']}".strip()
        results.append(
            {
                'fuel_name': fuel_label,
                'liters_sold_today': _quantize(row['liters_sold_today']),
                'total_amount_today': _quantize(row['total_amount_today']),
            }
        )
    return results
