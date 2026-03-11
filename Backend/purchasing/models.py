from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from core.base_models import BaseModel
from employees.models import Partners
from financial.models import Currency
from inventory.models import Fuel, TankStorage


THOUSAND = Decimal('1000')
TWO_DECIMAL_PLACES = Decimal('0.01')


def quantize_2(value: Decimal) -> Decimal:
    return value.quantize(TWO_DECIMAL_PLACES, rounding=ROUND_HALF_UP)


class Supplier(BaseModel):
    supplier_id = models.BigAutoField(primary_key=True)
    supplier_name = models.CharField(max_length=150, db_index=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'purchasing_suppliers'
        ordering = ['supplier_name', 'supplier_id']
        indexes = [
            models.Index(fields=['supplier_name']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        return self.supplier_name


class Purchase(BaseModel):
    purchase_id = models.BigAutoField(primary_key=True)
    fuel = models.ForeignKey(Fuel, on_delete=models.PROTECT, related_name='purchases')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchases')
    partner = models.ForeignKey(Partners, on_delete=models.PROTECT, related_name='purchases')
    purchase_date = models.DateField(db_index=True)
    amount_ton = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))],
    )
    density = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text='Fuel density in kilograms per liter.',
    )
    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Purchase price per ton.',
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='purchases')
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.000000'),
        validators=[MinValueValidator(Decimal('0.000001'))],
        help_text='Latest exchange rate from purchase currency to base currency.',
    )
    total_amount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total purchase amount in the purchase currency.',
    )
    total_amount_in_base_currency = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total purchase amount converted to the base currency.',
    )
    invoice_number = models.CharField(max_length=100, blank=True, db_index=True)
    paid_currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='purchase_paid_amounts',
    )
    paid_currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.000000'),
        validators=[MinValueValidator(Decimal('0.000001'))],
        help_text='Derived exchange rate from paid currency to purchase currency.',
    )
    paid_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    paid_amount_in_purchase_currency_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Paid amount converted into the purchase currency.',
    )
    paid_amount_in_base_currency_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Paid amount converted into the base currency.',
    )
    pay_date = models.DateField(null=True, blank=True)
    remaining_amount_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Remaining amount in the purchase currency.',
    )
    remaining_amount_in_base_currency_value = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Remaining amount in the base currency.',
    )

    class Meta:
        db_table = 'purchasing_purchases'
        ordering = ['-purchase_date', '-purchase_id']
        indexes = [
            models.Index(fields=['purchase_date']),
            models.Index(fields=['supplier', 'purchase_date']),
            models.Index(fields=['partner', 'purchase_date']),
            models.Index(fields=['currency']),
            models.Index(fields=['paid_currency']),
        ]

    def __str__(self):
        return f'Purchase #{self.purchase_id}'

    @property
    def weight_kg(self) -> Decimal:
        return quantize_2(self.amount_ton * THOUSAND)

    @property
    def total_liter(self) -> Decimal:
        if self.density <= Decimal('0'):
            return Decimal('0.00')
        return quantize_2((self.amount_ton * THOUSAND) / self.density)

    @property
    def total_amount(self) -> Decimal:
        return quantize_2(self.total_amount_value)

    @property
    def paid_amount_in_purchase_currency(self) -> Decimal:
        return quantize_2(self.paid_amount_in_purchase_currency_value)

    @property
    def remaining_amount(self) -> Decimal:
        return quantize_2(self.remaining_amount_value)

    @property
    def paid_amount_in_base_currency(self) -> Decimal:
        return quantize_2(self.paid_amount_in_base_currency_value)

    @property
    def remaining_amount_in_base_currency(self) -> Decimal:
        return quantize_2(self.remaining_amount_in_base_currency_value)

    @property
    def payment_status(self) -> str:
        return 'completed' if self.remaining_amount == Decimal('0.00') else 'remaining'

    @property
    def status_label(self) -> str:
        if self.payment_status == 'completed':
            return 'Completed'
        return f'Remaining: {self.remaining_amount}'


class OrderPurchase(BaseModel):
    order_purchase_id = models.BigAutoField(primary_key=True)
    order_id = models.PositiveIntegerField(
        db_index=True,
        default=0,
        help_text='Automatically assigned order number.',
    )
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='order_purchases')
    amount_per_ton = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))],
    )
    density = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text='Fuel density in kilograms per liter.',
    )
    purchase_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Purchase price per ton.',
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='order_purchases')
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.000000'),
        validators=[MinValueValidator(Decimal('0.000001'))],
        help_text='Latest exchange rate from order currency to base currency.',
    )
    currency_cost = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Estimated order cost converted to the base currency.',
    )
    transport_cost = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    tanker = models.ForeignKey(TankStorage, on_delete=models.PROTECT, related_name='order_purchases')
    date = models.DateField(db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_order_purchases',
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'purchasing_order_purchases'
        ordering = ['-date', '-order_purchase_id']
        indexes = [
            models.Index(fields=['order_id']),
            models.Index(fields=['supplier', 'date']),
            models.Index(fields=['tanker', 'date']),
            models.Index(fields=['currency']),
        ]

    def __str__(self):
        return f'Order Purchase #{self.order_purchase_id}'

    def save(self, *args, **kwargs):
        assign_order_id = not self.order_id
        super().save(*args, **kwargs)
        if assign_order_id and self.order_id != self.pk:
            self.order_id = self.pk
            type(self).objects.filter(pk=self.pk).update(order_id=self.pk)

    @property
    def density_per_ton(self) -> Decimal:
        if self.density <= Decimal('0'):
            return Decimal('0.00')
        return quantize_2(THOUSAND / self.density)

    @property
    def total_liter(self) -> Decimal:
        if self.density <= Decimal('0'):
            return Decimal('0.00')
        return quantize_2((self.amount_per_ton * THOUSAND) / self.density)

    @property
    def estimated_total_cost(self) -> Decimal:
        total = (self.amount_per_ton * self.purchase_price) + self.transport_cost
        return quantize_2(total)
