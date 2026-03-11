from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from django.db.models import Case, DecimalField, ExpressionWrapper, F, Sum, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone

from inventory.models import InventoryTransaction, TankStorage


TWO_DECIMAL_PLACES = Decimal('0.01')


def _decimal_value(value=Decimal('0.00')):
    return Value(value, output_field=DecimalField(max_digits=18, decimal_places=2))


def _quantize(value: Decimal) -> Decimal:
    if value is None:
        return Decimal('0.00')
    if not isinstance(value, Decimal):
        value = Decimal(str(value))
    return value.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


def _parse_date(value: Optional[str]):
    if not value:
        return None
    return timezone.datetime.strptime(value, '%Y-%m-%d').date()


def _apply_date_range(queryset, date_from: Optional[date], date_to: Optional[date]):
    if date_from is not None:
        queryset = queryset.filter(date_time__date__gte=date_from)
    if date_to is not None:
        queryset = queryset.filter(date_time__date__lte=date_to)
    return queryset


def _fuel_label(fuel_name: Optional[str], fuel_type: Optional[str]) -> str:
    return f"{fuel_name or ''} {fuel_type or ''}".strip()


def _signed_quantity_expression():
    return Case(
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


def _get_filters(filters: dict):
    return {
        'start_date': _parse_date(filters.get('start_date')),
        'end_date': _parse_date(filters.get('end_date')),
        'fuel_type': filters.get('fuel_type'),
    }


def get_tank_status_report(filters: dict):
    parsed = _get_filters(filters)
    fuel_type = parsed['fuel_type']

    tanks = TankStorage.objects.select_related('Fuel').all().order_by('tank_number', 'id')
    if fuel_type:
        tanks = tanks.filter(Fuel__type__iexact=fuel_type)

    transactions = InventoryTransaction.objects.select_related('tank_id').all()
    if fuel_type:
        transactions = transactions.filter(fuel_id__type__iexact=fuel_type)
    transactions = _apply_date_range(transactions, parsed['start_date'], parsed['end_date'])

    totals = {}
    for transaction in transactions:
        totals.setdefault(transaction.tank_id_id, Decimal('0.00'))
        totals[transaction.tank_id_id] += transaction.quantity if transaction.transaction_type in ['purchase_in', 'return_in'] else Decimal('0.00')
        if transaction.transaction_type in ['sale_out', 'lending_out']:
            totals[transaction.tank_id_id] -= transaction.quantity
        if transaction.transaction_type == 'adjustment':
            if transaction.adjustment_direction == 'in':
                totals[transaction.tank_id_id] += transaction.quantity
            elif transaction.adjustment_direction == 'out':
                totals[transaction.tank_id_id] -= transaction.quantity

    results = []
    for tank in tanks:
        current_quantity = _quantize(totals.get(tank.id, Decimal('0.00')))
        results.append(
            {
                'tank_number': tank.tank_number,
                'fuel': _fuel_label(tank.Fuel.fuel_name, tank.Fuel.type),
                'capacity': _quantize(tank.capacity),
                'current_quantity': current_quantity,
            }
        )

    return results


def get_fuel_stock_summary(filters: dict):
    parsed = _get_filters(filters)
    queryset = InventoryTransaction.objects.all()
    if parsed['fuel_type']:
        queryset = queryset.filter(fuel_id__type__iexact=parsed['fuel_type'])
    queryset = _apply_date_range(queryset, parsed['start_date'], parsed['end_date'])

    rows = (
        queryset.values('fuel_id__fuel_name', 'fuel_id__type')
        .annotate(
            total_liters=Coalesce(
                Sum(_signed_quantity_expression()),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            )
        )
        .order_by('fuel_id__fuel_name', 'fuel_id__type')
    )

    results = []
    for row in rows:
        results.append(
            {
                'fuel': _fuel_label(row['fuel_id__fuel_name'], row['fuel_id__type']),
                'total_liters': _quantize(row['total_liters']),
            }
        )

    return results


def get_fuel_movement_report(filters: dict):
    parsed = _get_filters(filters)
    queryset = InventoryTransaction.objects.select_related('fuel_id').all()
    if parsed['fuel_type']:
        queryset = queryset.filter(fuel_id__type__iexact=parsed['fuel_type'])
    queryset = _apply_date_range(queryset, parsed['start_date'], parsed['end_date'])

    rows = queryset.order_by('-date_time', '-id')

    results = []
    for row in rows:
        reference = row.reference_type or ''
        if row.reference_id:
            reference = f"{reference} #{row.reference_id}".strip()

        results.append(
            {
                'date': row.date_time,
                'transaction_type': row.transaction_type,
                'quantity': _quantize(row.quantity),
                'reference': reference,
            }
        )

    return results
