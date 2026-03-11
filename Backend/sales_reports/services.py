from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from django.db.models import DecimalField, F, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from sales.models import Sale


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
        queryset = queryset.filter(sale_date__gte=date_from)
    if date_to is not None:
        queryset = queryset.filter(sale_date__lte=date_to)
    return queryset


def _fuel_label(fuel_name: Optional[str], fuel_type: Optional[str]) -> str:
    return f"{fuel_name or ''} {fuel_type or ''}".strip()


def _monthly_default_range():
    today = timezone.localdate()
    start = today.replace(day=1)
    next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
    end = next_month - timedelta(days=1)
    return start, end


def _get_filtered_sales(filters: dict):
    queryset = Sale.objects.select_related('fuel')
    date_from = _parse_date(filters.get('start_date'))
    date_to = _parse_date(filters.get('end_date'))
    fuel_type = filters.get('fuel_type')

    queryset = _apply_date_range(queryset, date_from, date_to)

    if fuel_type:
        queryset = queryset.filter(fuel__type__iexact=fuel_type)

    return queryset, date_from, date_to


def get_daily_sales_report(filters: dict):
    queryset, _, _ = _get_filtered_sales(filters)

    rows = (
        queryset.values('sale_date', 'fuel__fuel_name', 'fuel__type')
        .annotate(
            liters_sold=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_amount=Coalesce(
                Sum('total_amount_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )
        .order_by('sale_date', 'fuel__fuel_name', 'fuel__type')
    )

    results = []
    for row in rows:
        liters = _quantize(row['liters_sold'])
        total = _quantize(row['total_amount'])
        price = _quantize(total / liters) if liters != Decimal('0.00') else Decimal('0.00')
        results.append(
            {
                'date': row['sale_date'],
                'fuel': _fuel_label(row['fuel__fuel_name'], row['fuel__type']),
                'liters_sold': liters,
                'price': price,
                'total_amount': total,
            }
        )

    return results


def get_monthly_sales_summary(filters: dict):
    queryset, date_from, date_to = _get_filtered_sales(filters)

    if date_from is None and date_to is None:
        date_from, date_to = _monthly_default_range()
        queryset = _apply_date_range(queryset, date_from, date_to)

    rows = (
        queryset.values('fuel__fuel_name', 'fuel__type')
        .annotate(
            total_liters=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_revenue=Coalesce(
                Sum('total_amount_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )
        .order_by('fuel__fuel_name', 'fuel__type')
    )

    results = []
    for row in rows:
        results.append(
            {
                'fuel': _fuel_label(row['fuel__fuel_name'], row['fuel__type']),
                'liters_sold': _quantize(row['total_liters']),
                'total_revenue': _quantize(row['total_revenue']),
            }
        )

    return results


def get_sales_by_fuel_type(filters: dict):
    queryset, _, _ = _get_filtered_sales(filters)

    rows = (
        queryset.values('fuel__fuel_name', 'fuel__type')
        .annotate(
            liters_sold=Coalesce(
                Sum('amount'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_revenue=Coalesce(
                Sum('total_amount_value'),
                _decimal_value(),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )
        .order_by('fuel__fuel_name', 'fuel__type')
    )

    results = []
    for row in rows:
        results.append(
            {
                'fuel': _fuel_label(row['fuel__fuel_name'], row['fuel__type']),
                'liters_sold': _quantize(row['liters_sold']),
                'total_revenue': _quantize(row['total_revenue']),
            }
        )

    return results
