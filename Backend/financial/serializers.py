from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import serializers
from django.utils import timezone

from employees.models import Employee

from .models import (
    Account,
    Currency,
    CurrencyRate,
    Expense,
    FinancialTransaction,
    PartnerDebt,
    PartnerDebtPayment,
    Salary,
)


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


RATE_QUANTIZE = Decimal('0.000001')
MONEY_QUANTIZE = Decimal('0.01')


def resolve_base_currency():
    base_currency = Currency.objects.filter(is_base=True).first()
    if base_currency is None:
        raise serializers.ValidationError({'currency_rate': ['No base currency is configured.']})
    return base_currency


def quantize_money(value):
    return Decimal(value).quantize(MONEY_QUANTIZE, rounding=ROUND_HALF_UP)


def resolve_currency_rate_value(currency, reference_date=None, *, field_name='currency_rate'):
    base_currency = resolve_base_currency()

    if currency.pk == base_currency.pk:
        return Decimal('1.000000')

    direct_rates = CurrencyRate.objects.filter(
        from_currency=currency,
        to_currency=base_currency,
    )
    inverse_rates = CurrencyRate.objects.filter(
        from_currency=base_currency,
        to_currency=currency,
    )

    if reference_date is not None:
        direct_rates = direct_rates.filter(date__lte=reference_date)
        inverse_rates = inverse_rates.filter(date__lte=reference_date)

    direct_rate = direct_rates.order_by('-date', '-created_at', '-id').first()
    if direct_rate is not None:
        return direct_rate.rate_value

    inverse_rate = inverse_rates.order_by('-date', '-created_at', '-id').first()
    if inverse_rate is not None:
        return (Decimal('1.000000') / inverse_rate.rate_value).quantize(
            RATE_QUANTIZE,
            rounding=ROUND_HALF_UP,
        )

    message = f'No exchange rate found for {currency.code} to base currency {base_currency.code}.'
    raise serializers.ValidationError({field_name: [message]})


def convert_amount_to_base(amount, rate_value):
    return (Decimal(amount) * Decimal(rate_value)).quantize(
        MONEY_QUANTIZE,
        rounding=ROUND_HALF_UP,
    )


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = [
            'id',
            'code',
            'name',
            'symbol',
            'is_base',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AccountSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source='currency.code', read_only=True)

    class Meta:
        model = Account
        fields = [
            'id',
            'name',
            'account_type',
            'currency',
            'currency_code',
            'is_active',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'currency_code', 'created_at', 'updated_at']


class CurrencyRateSerializer(serializers.ModelSerializer):
    from_currency_code = serializers.CharField(source='from_currency.code', read_only=True)
    to_currency_code = serializers.CharField(source='to_currency.code', read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CurrencyRate
        fields = [
            'id',
            'from_currency',
            'from_currency_code',
            'to_currency',
            'to_currency_code',
            'rate_value',
            'date',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'from_currency_code',
            'to_currency_code',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):
        full_name = obj.created_by.get_full_name().strip()
        return full_name or obj.created_by.username

    def validate(self, attrs):
        from_currency = attrs.get('from_currency', getattr(self.instance, 'from_currency', None))
        to_currency = attrs.get('to_currency', getattr(self.instance, 'to_currency', None))
   
   
    # def validate(sel,attrs):
    #     from_currency = attrs.get('from_currency',getattr(self.instance,'from_currency',None))
    #     to_currency = attrs.get('to_currency', getattr(self.instance, 'to_currency',None))


        if from_currency is not None and to_currency is not None and from_currency.pk == to_currency.pk:
            raise serializers.ValidationError(
                {'to_currency': ['From and to currencies must be different.']}
            )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if user is None or not user.is_authenticated:
            raise serializers.ValidationError({'created_by': ['Authenticated user is required.']})

        validated_data['created_by'] = user
        return super().create(validated_data)


class SalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Salary
        fields = [
            'id',
            'employee',
            'employee_name',
            'year',
            'month',
            'base_salary',
            'bonus',
            'net_salary',
            'pay_date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'employee_name', 'created_at', 'updated_at']
        extra_kwargs = {
            'base_salary': {'required': False},
            'net_salary': {'required': False},
        }

    def get_employee_name(self, obj):
        user = getattr(obj.employee, 'user', None)
        if user is None:
            return str(obj.employee)
        return user.get_full_name().strip() or user.username

    def validate(self, attrs):
        employee = attrs.get('employee', getattr(self.instance, 'employee', None))
        year = attrs.get('year', getattr(self.instance, 'year', None))
        month = attrs.get('month', getattr(self.instance, 'month', None))
        net_salary = attrs.get('net_salary')
        current_employee = getattr(self.instance, 'employee', None)

        if employee is not None and employee.status != Employee.STATUS_ACTIVE:
            is_same_existing_employee = (
                self.instance is not None
                and current_employee is not None
                and employee.pk == current_employee.pk
            )
            if not is_same_existing_employee:
                raise serializers.ValidationError(
                    {'employee': ['Inactive employees cannot receive new salary records.']}
                )

        if attrs.get('base_salary') is None:
            if self.instance is None:
                if employee is None:
                    raise serializers.ValidationError({'employee': ['Employee is required.']})
                attrs['base_salary'] = employee.salary
            else:
                employee_changed = (
                    employee is not None
                    and current_employee is not None
                    and employee.pk != current_employee.pk
                    and 'employee' in attrs
                )
                attrs['base_salary'] = employee.salary if employee_changed else self.instance.base_salary

        base_salary = attrs.get('base_salary', Decimal('0.00'))
        bonus = attrs.get('bonus', getattr(self.instance, 'bonus', Decimal('0.00')))

        if net_salary is None:
            attrs['net_salary'] = base_salary + bonus

        if employee is not None and year is not None and month is not None:
            queryset = Salary.objects.filter(employee=employee, year=year, month=month)
            if self.instance is not None:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {'non_field_errors': ['Salary for this employee, year, and month already exists.']}
                )

        return attrs


class ExpenseSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source='currency.code', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'amount',
            'currency_rate',
            'amount_in_base_currency',
            'currency',
            'currency_code',
            'pay_date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'currency_code',
            'currency_rate',
            'amount_in_base_currency',
            'created_at',
            'updated_at',
        ]

    def validate(self, attrs):
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', Decimal('0.00')))
        pay_date = attrs.get('pay_date', getattr(self.instance, 'pay_date', None))

        if currency is None:
            return attrs

        rate_value = resolve_currency_rate_value(currency, pay_date, field_name='currency')
        attrs['currency_rate'] = rate_value
        attrs['amount_in_base_currency'] = convert_amount_to_base(amount, rate_value)
        return attrs


class PartnerDebtPaymentSerializer(serializers.ModelSerializer):
    currency_paid_code = serializers.CharField(source='currency_paid.code', read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PartnerDebtPayment
        fields = [
            'id',
            'amount_paid',
            'currency_paid',
            'currency_paid_code',
            'currency_rate',
            'amount_paid_in_base',
            'paid_date',
            'description',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_created_by_name(self, obj):
        if obj.created_by is None:
            return ''
        full_name = obj.created_by.get_full_name().strip()
        return full_name or obj.created_by.username


class PartnerDebtSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    partner_full_name = serializers.SerializerMethodField(read_only=True)
    remaining_amount = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    updated_by_name = serializers.SerializerMethodField(read_only=True)
    paid_date = NullableDateField(required=False, allow_null=True)
    payment_amount = serializers.DecimalField(
        max_digits=18,
        decimal_places=2,
        required=False,
        write_only=True,
        min_value=Decimal('0.00'),
    )
    currency_paid = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    payment_date = NullableDateField(required=False, allow_null=True, write_only=True)
    payment_description = serializers.CharField(required=False, allow_blank=True, write_only=True)
    payments = PartnerDebtPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = PartnerDebt
        fields = [
            'id',
            'partner',
            'partner_full_name',
            'amount_money',
            'currency_rate',
            'total_in',
            'paid_amount',
            'paid_date',
            'status',
            'remaining_amount',
            'payment_amount',
            'currency_paid',
            'payment_date',
            'payment_description',
            'payments',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'currency',
            'currency_code',
            'date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'partner_full_name',
            'currency_code',
            'currency_rate',
            'total_in',
            'paid_amount',
            'paid_date',
            'status',
            'remaining_amount',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'payments',
            'created_at',
            'updated_at',
        ]

    def get_partner_full_name(self, obj):
        return f'{obj.partner.first_name} {obj.partner.last_name}'.strip()

    def get_remaining_amount(self, obj):
        remaining = (obj.total_in - obj.paid_amount).quantize(MONEY_QUANTIZE, rounding=ROUND_HALF_UP)
        return str(max(remaining, Decimal('0.00')))

    def get_created_by_name(self, obj):
        if obj.created_by is None:
            return ''
        full_name = obj.created_by.get_full_name().strip()
        return full_name or obj.created_by.username

    def get_updated_by_name(self, obj):
        if obj.updated_by is None:
            return ''
        full_name = obj.updated_by.get_full_name().strip()
        return full_name or obj.updated_by.username

    def _get_existing_paid_amount(self):
        if self.instance is None:
            return Decimal('0.00')
        return (
            self.instance.payments.aggregate(
                total=Coalesce(Sum('amount_paid_in_base'), Decimal('0.00')),
            )['total']
            or Decimal('0.00')
        )

    def _extract_payment_payload(self, validated_data):
        return {
            'payment_amount': validated_data.pop('payment_amount', None),
            'currency_paid': validated_data.pop('currency_paid', None),
            'payment_date': validated_data.pop('payment_date', None),
            'payment_description': validated_data.pop('payment_description', ''),
            'resolved_payment_rate': validated_data.pop('_resolved_payment_rate', None),
            'resolved_payment_in_base': validated_data.pop('_resolved_payment_in_base', None),
        }

    def _build_status(self, total_in, paid_amount):
        remaining = quantize_money(total_in - paid_amount)
        if remaining > Decimal('0.00'):
            return f'Remaining: {remaining}'
        return 'Completed'

    def _refresh_partner_debt(self, partner_debt, updated_by=None):
        total_paid = (
            partner_debt.payments.aggregate(
                total=Coalesce(Sum('amount_paid_in_base'), Decimal('0.00')),
            )['total']
            or Decimal('0.00')
        )
        latest_payment = partner_debt.payments.order_by('-paid_date', '-created_at', '-id').first()
        partner_debt.paid_amount = quantize_money(total_paid)
        partner_debt.paid_date = latest_payment.paid_date if latest_payment is not None else None
        partner_debt.status = self._build_status(partner_debt.total_in, partner_debt.paid_amount)
        if updated_by is not None:
            partner_debt.updated_by = updated_by
        partner_debt.save(update_fields=['paid_amount', 'paid_date', 'status', 'updated_by', 'updated_at'])

    def _create_payment(self, partner_debt, payment_payload, user):
        payment_amount = payment_payload['payment_amount']
        if payment_amount is None or payment_amount <= Decimal('0.00'):
            return

        PartnerDebtPayment.objects.create(
            partner_debt=partner_debt,
            amount_paid=payment_amount,
            currency_paid=payment_payload['currency_paid'],
            currency_rate=payment_payload['resolved_payment_rate'],
            amount_paid_in_base=payment_payload['resolved_payment_in_base'],
            paid_date=payment_payload['payment_date'],
            description=payment_payload['payment_description'],
            created_by=user if user is not None and user.is_authenticated else None,
        )

    def validate(self, attrs):
        debt_date = attrs.get('date', getattr(self.instance, 'date', None))
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        amount_money = attrs.get('amount_money', getattr(self.instance, 'amount_money', Decimal('0.00')))
        payment_amount = attrs.get('payment_amount')
        payment_date = attrs.get('payment_date')
        payment_currency = attrs.get('currency_paid')
        payment_description = attrs.get('payment_description', '')
        existing_paid_amount = self._get_existing_paid_amount()
        has_new_payment = payment_amount is not None and payment_amount > Decimal('0.00')
        has_payment_metadata = bool(payment_currency or payment_date or payment_description.strip())

        today = timezone.localdate()
        if debt_date is not None and debt_date > today:
            raise serializers.ValidationError({'date': ['Date cannot be in the future.']})

        if payment_date is not None and payment_date > today:
            raise serializers.ValidationError({'payment_date': ['Payment date cannot be in the future.']})

        if debt_date is not None and payment_date is not None and payment_date < debt_date:
            raise serializers.ValidationError({'payment_date': ['Payment date cannot be earlier than debt date.']})

        if has_new_payment and payment_currency is None:
            raise serializers.ValidationError({'currency_paid': ['Payment currency is required when payment amount is provided.']})

        if has_new_payment and payment_date is None:
            raise serializers.ValidationError({'payment_date': ['Payment date is required when payment amount is provided.']})

        if not has_new_payment and has_payment_metadata:
            raise serializers.ValidationError(
                {'payment_amount': ['Payment amount is required when payment details are provided.']}
            )

        if currency is None:
            return attrs

        rate_value = resolve_currency_rate_value(currency, debt_date, field_name='currency')
        total_in = convert_amount_to_base(amount_money, rate_value)
        new_payment_in_base = Decimal('0.00')

        if has_new_payment:
            payment_rate = resolve_currency_rate_value(payment_currency, payment_date, field_name='currency_paid')
            new_payment_in_base = convert_amount_to_base(payment_amount, payment_rate)
            attrs['_resolved_payment_rate'] = payment_rate
            attrs['_resolved_payment_in_base'] = new_payment_in_base

        cumulative_paid_amount = quantize_money(existing_paid_amount + new_payment_in_base)
        if cumulative_paid_amount > total_in:
            raise serializers.ValidationError(
                {'payment_amount': ['Paid amount cannot exceed total amount in base currency.']}
            )

        attrs['currency_rate'] = rate_value
        attrs['total_in'] = total_in
        attrs['paid_amount'] = cumulative_paid_amount
        attrs['paid_date'] = payment_date if has_new_payment else getattr(self.instance, 'paid_date', None)
        attrs['status'] = self._build_status(total_in, cumulative_paid_amount)

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError({'created_by': ['Authenticated user is required.']})

        payment_payload = self._extract_payment_payload(validated_data)
        validated_data['created_by'] = user
        validated_data['updated_by'] = user

        with transaction.atomic():
            partner_debt = super().create(validated_data)
            self._create_payment(partner_debt, payment_payload, user)
            self._refresh_partner_debt(partner_debt, updated_by=user)
        return partner_debt

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        payment_payload = self._extract_payment_payload(validated_data)

        if user is not None and user.is_authenticated:
            validated_data['updated_by'] = user
            if instance.created_by_id is None:
                validated_data['created_by'] = user

        with transaction.atomic():
            partner_debt = super().update(instance, validated_data)
            self._create_payment(partner_debt, payment_payload, user)
            self._refresh_partner_debt(partner_debt, updated_by=user if user is not None and user.is_authenticated else None)
        return partner_debt


class FinancialTransactionSerializer(serializers.ModelSerializer):
    from_account_name = serializers.CharField(source='from_account.name', read_only=True)
    to_account_name = serializers.CharField(source='to_account.name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    updated_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FinancialTransaction
        fields = [
            'id',
            'from_account',
            'from_account_name',
            'to_account',
            'to_account_name',
            'transaction_type',
            'amount',
            'currency',
            'currency_code',
            'date_time',
            'reference_type',
            'reference_id',
            'description',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'from_account_name',
            'to_account_name',
            'currency_code',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):
        full_name = obj.created_by.get_full_name().strip()
        return full_name or obj.created_by.username

    def get_updated_by_name(self, obj):
        if obj.updated_by is None:
            return ''
        full_name = obj.updated_by.get_full_name().strip()
        return full_name or obj.updated_by.username

    def validate(self, attrs):
        transaction_type = attrs.get('transaction_type', getattr(self.instance, 'transaction_type', None))
        from_account = attrs.get('from_account', getattr(self.instance, 'from_account', None))
        to_account = attrs.get('to_account', getattr(self.instance, 'to_account', None))
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        date_time = attrs.get('date_time', getattr(self.instance, 'date_time', None))
        reference_type = attrs.get('reference_type', getattr(self.instance, 'reference_type', ''))
        reference_id = attrs.get('reference_id', getattr(self.instance, 'reference_id', None))

        if date_time is not None and date_time > timezone.now():
            raise serializers.ValidationError({'date_time': ['Transaction date cannot be in the future.']})

        if reference_id is not None and not str(reference_type).strip():
            raise serializers.ValidationError(
                {'reference_type': ['Reference type is required when reference ID is provided.']}
            )

        if transaction_type == FinancialTransaction.TYPE_DEPOSIT:
            if to_account is None:
                raise serializers.ValidationError({'to_account': ['Destination account is required for deposits.']})
            if from_account is not None:
                raise serializers.ValidationError({'from_account': ['Source account must be empty for deposits.']})
        elif transaction_type == FinancialTransaction.TYPE_WITHDRAW:
            if from_account is None:
                raise serializers.ValidationError({'from_account': ['Source account is required for withdrawals.']})
            if to_account is not None:
                raise serializers.ValidationError(
                    {'to_account': ['Destination account must be empty for withdrawals.']}
                )
        elif transaction_type == FinancialTransaction.TYPE_TRANSFER:
            if from_account is None:
                raise serializers.ValidationError({'from_account': ['Source account is required for transfers.']})
            if to_account is None:
                raise serializers.ValidationError(
                    {'to_account': ['Destination account is required for transfers.']}
                )
            if from_account is not None and to_account is not None and from_account.pk == to_account.pk:
                raise serializers.ValidationError(
                    {'to_account': ['Source and destination accounts must be different.']}
                )

        if currency is not None:
            if from_account is not None and from_account.currency_id != currency.id:
                raise serializers.ValidationError(
                    {'from_account': ['Source account currency must match the transaction currency.']}
                )
            if to_account is not None and to_account.currency_id != currency.id:
                raise serializers.ValidationError(
                    {'to_account': ['Destination account currency must match the transaction currency.']}
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError({'created_by': ['Authenticated user is required.']})

        validated_data['created_by'] = user
        validated_data['updated_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if user is not None and user.is_authenticated:
            validated_data['updated_by'] = user
            if instance.created_by_id is None:
                validated_data['created_by'] = user

        return super().update(instance, validated_data)
