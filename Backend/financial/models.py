from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from rest_framework.exceptions import ValidationError

from core.base_models import BaseModel
from employees.models import Employee, Partners


class Currency(BaseModel):
    code = models.CharField(max_length=3, unique=True, db_index=True)
    name = models.CharField(max_length=64)
    symbol = models.CharField(max_length=8, blank=True)
    is_base = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'finance_currencies'
        ordering = ['code']
        constraints = [
            models.UniqueConstraint(
                fields=['is_base'],
                condition=models.Q(is_base=True),
                name='finance_currency_single_base',
            ),
        ]

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.code} - {self.name}'


class CurrencyRate(BaseModel):
    from_currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='rates_from',
    )
    to_currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='rates_to',
    )
    rate_value = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        validators=[MinValueValidator(Decimal('0.000001'))],
    )
    date = models.DateField(db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_currency_rates',
    )

    class Meta:
        db_table = 'finance_currency_rates'
        ordering = ['-date', '-created_at', '-id']
        constraints = [
            models.CheckConstraint(
                check=~models.Q(from_currency=models.F('to_currency')),
                name='finance_currency_rate_from_to_diff',
            ),
        ]
        indexes = [
            models.Index(fields=['from_currency', 'to_currency', 'date']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f'{self.from_currency.code}->{self.to_currency.code} @ {self.rate_value} ({self.date})'


class Account(BaseModel):
    TYPE_CASH = 'cash'
    TYPE_EXCHANGE = 'exchange'
    TYPE_CHOICES = [
        (TYPE_CASH, 'Cash'),
        (TYPE_EXCHANGE, 'Exchange'),
    ]

    name = models.CharField(max_length=150, db_index=True)
    account_type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='accounts')
    is_active = models.BooleanField(default=True, db_index=True)
    description = models.TextField(blank=True) 
    class Meta:
        db_table = 'finance_accounts'
        ordering = ['name', 'id']
        unique_together = ['name', 'currency']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['account_type', 'is_active']),
        ]

    def __str__(self):
        return f'{self.name} ({self.account_type}) - {self.currency.code}'


class Salary(BaseModel):
    MONTH_CHOICES = [(month, str(month)) for month in range(1, 13)]

    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name='salary_records')
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2200)],
        db_index=True,
    )
    month = models.PositiveSmallIntegerField(
        choices=MONTH_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        db_index=True,
    )
    base_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    bonus = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    net_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    pay_date = models.DateField(db_index=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'finance_salaries'
        ordering = ['-pay_date', '-id']
        
        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'year', 'month'],
                name='finance_salary_employee_year_month_unique',
            )
        ]
        indexes = [
            models.Index(fields=['employee', 'year', 'month']),
            models.Index(fields=['pay_date']),
        ]

    def __str__(self):
        return f'{self.employee} - {self.year}/{self.month}'


class Expense(BaseModel):
    title = models.CharField(max_length=255, db_index=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    amount_in_base_currency = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='expenses')
    pay_date = models.DateField(db_index=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'finance_expenses'
        ordering = ['-pay_date', '-id']
        indexes = [
            models.Index(fields=['pay_date']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return f'{self.title} - {self.amount} {self.currency.code}'


class PartnerDebt(BaseModel):
    partner = models.ForeignKey(Partners, on_delete=models.PROTECT, related_name='debts')
    amount_money = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    total_in = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    paid_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=128, default='Remaining: 0.00')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_partner_debts',
        null=True,
        blank=True,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='updated_partner_debts',
        null=True,
        blank=True,
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='partner_debts')
    date = models.DateField(db_index=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'partner_debts'
        ordering = ['-date', '-id']
        indexes = [
            models.Index(fields=['partner', 'date']),
            models.Index(fields=['currency']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.partner} - {self.amount_money} {self.currency.code}'


class PartnerDebtPayment(BaseModel):
    partner_debt = models.ForeignKey(
        PartnerDebt,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    amount_paid = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    currency_paid = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='partner_debt_payments',
    )
    currency_rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        default=Decimal('1.000000'),
        validators=[MinValueValidator(Decimal('0.000001'))],
    )
    amount_paid_in_base = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    paid_date = models.DateField(db_index=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_partner_debt_payments',
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'partner_debt_payments'
        ordering = ['-paid_date', '-created_at', '-id']
        indexes = [
            models.Index(fields=['partner_debt', 'paid_date']),
            models.Index(fields=['currency_paid']),
        ]

    def __str__(self):
        return f'{self.partner_debt_id} - {self.amount_paid} {self.currency_paid.code}'


class FinancialTransaction(BaseModel):
    TYPE_DEPOSIT = 'deposit'
    TYPE_WITHDRAW = 'withdraw'
    TYPE_TRANSFER = 'transfer'
    TYPE_CHOICES = [
        (TYPE_DEPOSIT, 'Deposit'),
        (TYPE_WITHDRAW, 'Withdraw'),
        (TYPE_TRANSFER, 'Transfer'),
    ]

    reference_types = [
        ('sales','فروشات'), 
        ('purchase','خرید'), 
        ('Expense','مصارف'), 
        ('lending_payment','دریافت قرض'), 
        ('salary','معاش'), 
        ('Exchange','صرافی'), 
    ]

    from_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='outgoing_financial_transactions',
        null=True,
        blank=True,
    )
    to_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='incoming_financial_transactions',
        null=True,
        blank=True,
    )
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='financial_transactions',
    )
    date_time = models.DateTimeField(db_index=True)
    reference_type = models.CharField(max_length=100,choices=reference_types, null=True, blank=True)
    reference_id = models.PositiveIntegerField(blank=True, null=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_financial_transactions',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='updated_financial_transactions',
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'finance_financial_transactions'
        ordering = ['-date_time', '-id']
        indexes = [
            models.Index(fields=['transaction_type', 'date_time']),
            models.Index(fields=['currency', 'date_time']),
            models.Index(fields=['from_account', 'date_time']),
            models.Index(fields=['to_account', 'date_time']),
        ]
    def clean(self):
        if self.reference_type and not self.reference_id:
            raise ValidationError('این قسمت لازم است')
        if self.transaction_type not in ['deposit','withdraw','transfer']:
            raise ValidationError('انتقال معتبر نیست')
    def __str__(self):
        if self.transaction_type == self.TYPE_DEPOSIT and self.to_account is not None:
            account_label = self.to_account.name
        elif self.transaction_type == self.TYPE_WITHDRAW and self.from_account is not None:
            account_label = self.from_account.name
        else:
            source_name = self.from_account.name if self.from_account else '-'
            target_name = self.to_account.name if self.to_account else '-'
            account_label = f'{source_name} -> {target_name}'

        return f'{self.get_transaction_type_display()} {self.amount} {self.currency.code} ({account_label})'
