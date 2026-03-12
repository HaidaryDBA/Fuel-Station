from decimal import Decimal

from django.conf import settings
from django.db import models

from employees.models import Employee


class Fuel(models.Model):
    fuel_name = models.CharField(max_length=125)
    type = models.CharField(max_length=125)

    class Meta:
        db_table = 'Feul'
        unique_together = ['fuel_name', 'type']

    def __str__(self):
        return f'{self.fuel_name} {self.type}'


class PriceHistory(models.Model):
    fuel = models.ForeignKey(Fuel, on_delete=models.PROTECT)
    price = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True,blank=True)

    class Meta:
        db_table = 'Price_history'

    def __str__(self):
        return f'{self.fuel} {self.price}'


class TankStorage(models.Model):
    Fuel = models.ForeignKey(Fuel, on_delete=models.PROTECT)
    tank_number = models.IntegerField()
    capacity = models.DecimalField(max_digits=200, decimal_places=2)
    min_level_alert = models.IntegerField()

    class Meta:
        db_table = 'Tank_Storage'
        unique_together = ['Fuel', 'tank_number']

    def __str__(self):
        return f'{self.Fuel} {self.tank_number}'

    def get_current_liters(self, exclude_transaction_id=None):
        total = Decimal('0.00')
        transactions = InventoryTransaction.objects.filter(tank_id=self)
        if exclude_transaction_id:
            transactions = transactions.exclude(pk=exclude_transaction_id)

        for transaction in transactions:
            quantity = abs(Decimal(transaction.quantity or 0))
            if transaction.transaction_type in ['purchase_in', 'return_in']:
                total += quantity
            elif transaction.transaction_type in ['sale_out', 'lending_out']:
                total -= quantity
            elif transaction.transaction_type == 'adjustment':
                if transaction.adjustment_direction == 'in':
                    total += quantity
                elif transaction.adjustment_direction == 'out':
                    total -= quantity

        return total


class FuelMotor(models.Model):
    tank_id = models.ForeignKey(TankStorage, on_delete=models.PROTECT)
    motor_name = models.CharField(max_length=100)
    fuel_id = models.ForeignKey(Fuel, on_delete=models.PROTECT)

    class Meta:
        db_table = 'Motors'

    def __str__(self):
        return f'{self.motor_name} {self.tank_id}'


class InventoryTransaction(models.Model):
    ADJUSTMENT_DIRECTION_IN = 'in'
    ADJUSTMENT_DIRECTION_OUT = 'out'
    ADJUSTMENT_DIRECTION_CHOICES = [
        (ADJUSTMENT_DIRECTION_IN, 'In'),
        (ADJUSTMENT_DIRECTION_OUT, 'Out'),
    ]
    TRANSACTION_TYPE_CHOICES = [
        ('purchase_in', 'purchase_In'),
        ('sale_out', 'Sale Out'),
        ('lending_out', 'Lending out'),
        ('return_in', 'Return in'),
        ('adjustment', 'Adjustment'),
    ]
    REFERENCE_CHOICES = [
        ('sale', 'Sale'),
        ('lending', 'Lendin'),
        ('purchase', 'Purchase'),
        ('adjustment', 'Adjustment'),
    ]

    tank_id = models.ForeignKey(TankStorage, on_delete=models.PROTECT)
    fuel_id = models.ForeignKey(Fuel, on_delete=models.PROTECT)
    transaction_type = models.CharField(max_length=125, choices=TRANSACTION_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reference_type = models.CharField(max_length=125, choices=REFERENCE_CHOICES)
    reference_id = models.PositiveIntegerField()
    date_time = models.DateTimeField()
    created_at = models.ForeignKey(Employee, on_delete=models.PROTECT, null=True, blank=True)
    created_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_inventory_transactions',
        null=True,
        blank=True,
    )
    description = models.TextField(max_length=1000)
    adjustment_direction = models.CharField(
        max_length=3,
        choices=ADJUSTMENT_DIRECTION_CHOICES,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'Inventory_transaction'

    def __str__(self):
        return f'{self.tank_id} {self.fuel_id}'
