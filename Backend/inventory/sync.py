from datetime import datetime, time
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from employees.models import Employee

from .models import InventoryTransaction


TWO_DECIMAL_PLACES = Decimal('0.01')
LITERS_PER_TON = Decimal('1000')


def _quantize_quantity(value):
    if isinstance(value, Decimal):
        quantity = value
    else:
        quantity = Decimal(str(value))
    return quantity.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


def _date_to_datetime(value):
    naive_dt = datetime.combine(value, time.min)
    if timezone.is_naive(naive_dt):
        return timezone.make_aware(naive_dt, timezone.get_current_timezone())
    return naive_dt


def _resolve_employee(user):
    employee = getattr(user, 'employee_profile', None) if user is not None else None
    if employee is not None:
        return employee

    employee = Employee.objects.select_related('user').order_by('id').first()
    if employee is None:
        raise serializers.ValidationError(
            {'non_field_errors': ['An employee record is required to sync inventory transactions.']}
        )
    return employee


def _validate_capacity(tank, quantity, exclude_transaction_id=None):
    current_liters = tank.get_current_liters(exclude_transaction_id=exclude_transaction_id)
    capacity_liters = Decimal(tank.capacity) * LITERS_PER_TON
    incoming_liters = abs(Decimal(quantity))
    if current_liters + incoming_liters > capacity_liters:
        raise serializers.ValidationError({'quantity': 'This transaction exceeds the tank capacity.'})


def _validate_non_negative(tank, quantity, exclude_transaction_id=None):
    current_liters = tank.get_current_liters(exclude_transaction_id=exclude_transaction_id)
    outgoing_liters = abs(Decimal(quantity))
    if current_liters - outgoing_liters < 0:
        raise serializers.ValidationError({'quantity': 'This transaction would make the tank inventory negative.'})


def _upsert_inventory_transaction(
    *,
    reference_type,
    reference_id,
    transaction_type,
    tank,
    fuel,
    quantity,
    business_date,
    description,
    user,
):
    transaction = InventoryTransaction.objects.filter(
        reference_type=reference_type,
        reference_id=reference_id,
        transaction_type=transaction_type,
    ).first()
    normalized_quantity = _quantize_quantity(quantity)
    occurred_at = _date_to_datetime(business_date)

    if transaction_type in ['purchase_in', 'return_in']:
        _validate_capacity(
            tank,
            normalized_quantity,
            exclude_transaction_id=transaction.id if transaction is not None else None,
        )
    if transaction_type in ['sale_out', 'lending_out']:
        _validate_non_negative(
            tank,
            normalized_quantity,
            exclude_transaction_id=transaction.id if transaction is not None else None,
        )

    if transaction is None:
        return InventoryTransaction.objects.create(
            tank_id=tank,
            fuel_id=fuel,
            transaction_type=transaction_type,
            quantity=normalized_quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            date_time=occurred_at,
            created_at=_resolve_employee(user),
            description=description,
        )

    transaction.tank_id = tank
    transaction.fuel_id = fuel
    transaction.quantity = normalized_quantity
    transaction.date_time = occurred_at
    transaction.description = description
    transaction.adjustment_direction = None
    transaction.save(
        update_fields=[
            'tank_id',
            'fuel_id',
            'quantity',
            'date_time',
            'description',
            'adjustment_direction',
        ]
    )
    return transaction


def delete_inventory_transaction(*, reference_type, reference_id, transaction_type):
    InventoryTransaction.objects.filter(
        reference_type=reference_type,
        reference_id=reference_id,
        transaction_type=transaction_type,
    ).delete()


def sync_sale_inventory_transaction(sale, user):
    return _upsert_inventory_transaction(
        reference_type='sale',
        reference_id=sale.sale_id,
        transaction_type='sale_out',
        tank=sale.motor.tank_id,
        fuel=sale.fuel,
        quantity=sale.amount,
        business_date=sale.sale_date,
        description=f'Auto-synced from sale #{sale.sale_id}.',
        user=user,
    )


def sync_lending_inventory_transaction(lending, user):
    if lending.tank_id is None:
        delete_inventory_transaction(
            reference_type='lending',
            reference_id=lending.lending_id,
            transaction_type='lending_out',
        )
        return None

    return _upsert_inventory_transaction(
        reference_type='lending',
        reference_id=lending.lending_id,
        transaction_type='lending_out',
        tank=lending.tank_id,
        fuel=lending.fuel,
        quantity=lending.amount,
        business_date=lending.sale_date,
        description=f'Auto-synced from lending #{lending.lending_id}.',
        user=user,
    )


def sync_order_purchase_inventory_transaction(order_purchase, user):
    return _upsert_inventory_transaction(
        reference_type='purchase',
        reference_id=order_purchase.order_purchase_id,
        transaction_type='purchase_in',
        tank=order_purchase.tanker,
        fuel=order_purchase.tanker.Fuel,
        quantity=order_purchase.total_liter,
        business_date=order_purchase.date,
        description=f'Auto-synced from order purchase #{order_purchase.order_purchase_id}.',
        user=user,
    )
