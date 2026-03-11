from decimal import Decimal, ROUND_HALF_UP

from django.core.validators import MinValueValidator
from django.db import models

from core.base_models import BaseModel
from employees.models import Customer
from financial.models import Currency
from inventory.models import Fuel, FuelMotor, TankStorage


TWO_DECIMAL_PLACES = Decimal('0.01')


def quantize_2(value: Decimal) -> Decimal:
    return value.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


class Sale(BaseModel):
    sale_id = models.BigAutoField(primary_key=True)
    fuel = models.ForeignKey(Fuel, on_delete=models.PROTECT, related_name='sales')
    motor = models.ForeignKey(FuelMotor, on_delete=models.PROTECT, related_name='sales')
    sale_date = models.DateField(db_index=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='sales')
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    total_amount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    total_amount_in_base_currency = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )

    class Meta:
        db_table = 'sales_sales'
        ordering = ['-sale_date', '-sale_id']
        indexes = [
            models.Index(fields=['sale_date']),
            models.Index(fields=['fuel', 'sale_date']),
            models.Index(fields=['motor', 'sale_date']),
            models.Index(fields=['currency']),
        ]

    def __str__(self):
        return f'Sale #{self.sale_id}'

    @property
    def total_amount(self) -> Decimal:
        return quantize_2(self.total_amount_value)


class Lending(BaseModel):
    STATUS_UNPAID = 'unpaid'
    STATUS_PARTIAL = 'partial'
    STATUS_PAID = 'paid'
    STATUS_OVERDUE = 'overdue'
    STATUS_CHOICES = [
        (STATUS_UNPAID, 'Unpaid'),
        (STATUS_PARTIAL, 'Partial'),
        (STATUS_PAID, 'Paid'),
        (STATUS_OVERDUE, 'Overdue'),
    ]

    lending_id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='lendings')
    fuel = models.ForeignKey(Fuel, on_delete=models.PROTECT, related_name='lendings')
    tank_id = models.ForeignKey(
        TankStorage,
        on_delete=models.PROTECT,
        related_name='lendings',
        null=True,
        blank=True,
    )
    guarantor = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='guaranteed_lendings',
        null=True,
        blank=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    discount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    sale_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    paid_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    total_amount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    remaining_amount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_UNPAID,
        db_index=True,
    )

    class Meta:
        db_table = 'sales_lendings'
        ordering = ['-sale_date', '-lending_id']
        indexes = [
            models.Index(fields=['customer', 'sale_date']),
            models.Index(fields=['fuel', 'sale_date']),
            models.Index(fields=['tank_id', 'sale_date']),
            models.Index(fields=['guarantor']),
            models.Index(fields=['end_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'Lending #{self.lending_id}'

    @property
    def gross_amount(self) -> Decimal:
        return quantize_2(self.amount * self.unit_price)

    @property
    def total_amount(self) -> Decimal:
        return quantize_2(self.total_amount_value)

    @property
    def remaining_amount(self) -> Decimal:
        return quantize_2(self.remaining_amount_value)
