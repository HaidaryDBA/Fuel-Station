from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from financial.models import Currency, CurrencyRate
from inventory.sync import sync_lending_inventory_transaction, sync_sale_inventory_transaction

from .models import Lending, Sale


class CurrencyRateResolutionMixin:
    def _get_base_currency(self):
        if not hasattr(self, '_cached_base_currency'):
            self._cached_base_currency = Currency.objects.filter(is_base=True).first()
        return self._cached_base_currency

    def _resolve_latest_currency_rate(self, from_currency, to_currency, error_field):
        if from_currency is None or to_currency is None:
            raise serializers.ValidationError({error_field: ['Currency is required.']})

        if from_currency.pk == to_currency.pk:
            return Decimal('1.000000')

        direct_rate = (
            CurrencyRate.objects
            .filter(from_currency=from_currency, to_currency=to_currency)
            .order_by('-date', '-id')
            .first()
        )
        if direct_rate is not None:
            return direct_rate.rate_value

        inverse_rate = (
            CurrencyRate.objects
            .filter(from_currency=to_currency, to_currency=from_currency)
            .order_by('-date', '-id')
            .first()
        )
        if inverse_rate is not None:
            return (Decimal('1.000000') / inverse_rate.rate_value).quantize(
                Decimal('0.000001'),
                rounding=ROUND_HALF_UP,
            )

        raise serializers.ValidationError(
            {
                error_field: [
                    f'No exchange rate found for {from_currency.code} to {to_currency.code}.'
                ]
            }
        )


class SaleSerializer(CurrencyRateResolutionMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    fuel_name = serializers.CharField(source='fuel.fuel_name', read_only=True)
    motor_name = serializers.CharField(source='motor.motor_name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    currency_rate = serializers.DecimalField(max_digits=18, decimal_places=6, read_only=True)
    base_currency_code = serializers.SerializerMethodField(read_only=True)
    total_amount = serializers.SerializerMethodField(read_only=True)
    total_amount_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id',
            'sale_id',
            'fuel',
            'fuel_name',
            'motor',
            'motor_name',
            'sale_date',
            'amount',
            'unit_price',
            'currency',
            'currency_code',
            'currency_rate',
            'base_currency_code',
            'total_amount',
            'total_amount_in_base_currency',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'sale_id',
            'fuel_name',
            'motor_name',
            'currency_code',
            'currency_rate',
            'base_currency_code',
            'total_amount',
            'total_amount_in_base_currency',
            'created_at',
            'updated_at',
        ]

    def get_base_currency_code(self, obj):
        base_currency = self._get_base_currency()
        return base_currency.code if base_currency is not None else ''

    def get_total_amount(self, obj):
        return str(obj.total_amount)

    def validate(self, attrs):
        fuel = attrs.get('fuel', getattr(self.instance, 'fuel', None))
        motor = attrs.get('motor', getattr(self.instance, 'motor', None))
        sale_date = attrs.get('sale_date', getattr(self.instance, 'sale_date', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', Decimal('0.00')))
        unit_price = attrs.get('unit_price', getattr(self.instance, 'unit_price', Decimal('0.00')))
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        today = timezone.localdate()

        if sale_date is not None and sale_date > today:
            raise serializers.ValidationError({'sale_date': ['Sale date cannot be in the future.']})

        if fuel is not None and motor is not None and motor.fuel_id_id != fuel.id:
            raise serializers.ValidationError(
                {'motor': ['Selected motor does not belong to the selected fuel.']}
            )

        if currency is None:
            return attrs

        base_currency = self._get_base_currency()
        if base_currency is None:
            raise serializers.ValidationError({'currency_rate': ['No base currency is configured.']})

        total_amount = (amount * unit_price).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        currency_rate = self._resolve_latest_currency_rate(currency, base_currency, 'currency_rate')
        total_amount_in_base_currency = (total_amount * currency_rate).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )

        attrs['currency_rate'] = currency_rate
        attrs['total_amount_value'] = total_amount
        attrs['total_amount_in_base_currency'] = total_amount_in_base_currency
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        instance = super().create(validated_data)
        sync_sale_inventory_transaction(instance, getattr(request, 'user', None))
        return instance

    def update(self, instance, validated_data):
        request = self.context.get('request')
        instance = super().update(instance, validated_data)
        sync_sale_inventory_transaction(instance, getattr(request, 'user', None))
        return instance


class LendingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    fuel_name = serializers.CharField(source='fuel.fuel_name', read_only=True)
    tank_name = serializers.SerializerMethodField(read_only=True)
    guarantor_name = serializers.CharField(source='guarantor.full_name', read_only=True)
    gross_amount = serializers.SerializerMethodField(read_only=True)
    total_amount = serializers.SerializerMethodField(read_only=True)
    remaining_amount = serializers.SerializerMethodField(read_only=True)
    status_label = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lending
        fields = [
            'id',
            'lending_id',
            'customer',
            'customer_name',
            'fuel',
            'fuel_name',
            'tank_id',
            'tank_name',
            'guarantor',
            'guarantor_name',
            'amount',
            'unit_price',
            'discount',
            'gross_amount',
            'total_amount',
            'sale_date',
            'end_date',
            'paid_amount',
            'remaining_amount',
            'status',
            'status_label',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'lending_id',
            'customer_name',
            'fuel_name',
            'tank_name',
            'guarantor_name',
            'gross_amount',
            'total_amount',
            'remaining_amount',
            'status',
            'status_label',
            'created_at',
            'updated_at',
        ]

    def get_gross_amount(self, obj):
        return str(obj.gross_amount)

    def get_total_amount(self, obj):
        return str(obj.total_amount)

    def get_remaining_amount(self, obj):
        return str(obj.remaining_amount)

    def get_tank_name(self, obj):
        if obj.tank_id is None:
            return ''
        return f'Tank #{obj.tank_id.tank_number}'

    def get_status_label(self, obj):
        labels = {
            Lending.STATUS_UNPAID: 'Unpaid',
            Lending.STATUS_PARTIAL: 'Partial',
            Lending.STATUS_PAID: 'Paid',
            Lending.STATUS_OVERDUE: 'Overdue',
        }
        return labels.get(obj.status, obj.status.title())

    def validate(self, attrs):
        customer = attrs.get('customer', getattr(self.instance, 'customer', None))
        guarantor = attrs.get('guarantor', getattr(self.instance, 'guarantor', None))
        tank = attrs.get('tank_id', getattr(self.instance, 'tank_id', None))
        sale_date = attrs.get('sale_date', getattr(self.instance, 'sale_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        fuel = attrs.get('fuel', getattr(self.instance, 'fuel', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', Decimal('0.00')))
        unit_price = attrs.get('unit_price', getattr(self.instance, 'unit_price', Decimal('0.00')))
        discount = attrs.get('discount', getattr(self.instance, 'discount', Decimal('0.00')))
        paid_amount = attrs.get('paid_amount', getattr(self.instance, 'paid_amount', Decimal('0.00')))
        today = timezone.localdate()

        if sale_date is not None and sale_date > today:
            raise serializers.ValidationError({'sale_date': ['Sale date cannot be in the future.']})

        if end_date is not None and sale_date is not None and end_date < sale_date:
            raise serializers.ValidationError({'end_date': ['End date cannot be earlier than sale date.']})

        if guarantor is not None and customer is not None and guarantor.pk == customer.pk:
            raise serializers.ValidationError({'guarantor': ['Guarantor must be different from customer.']})

        if self.instance is None and tank is None:
            raise serializers.ValidationError({'tank_id': ['Tank is required for new lendings.']})

        if tank is not None and fuel is not None and tank.Fuel_id != fuel.id:
            raise serializers.ValidationError({'fuel': ['Selected fuel must match the selected tank fuel.']})

        gross_amount = (amount * unit_price).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if discount > gross_amount:
            raise serializers.ValidationError({'discount': ['Discount cannot exceed the gross amount.']})

        total_amount = max(gross_amount - discount, Decimal('0.00')).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )
        if paid_amount > total_amount:
            raise serializers.ValidationError({'paid_amount': ['Paid amount cannot exceed total lending amount.']})

        remaining_amount = max(total_amount - paid_amount, Decimal('0.00')).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )

        if remaining_amount == Decimal('0.00'):
            status = Lending.STATUS_PAID
        elif end_date is not None and end_date < today:
            status = Lending.STATUS_OVERDUE
        elif paid_amount > Decimal('0.00'):
            status = Lending.STATUS_PARTIAL
        else:
            status = Lending.STATUS_UNPAID

        attrs['total_amount_value'] = total_amount
        attrs['remaining_amount_value'] = remaining_amount
        attrs['status'] = status
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        instance = super().create(validated_data)
        sync_lending_inventory_transaction(instance, getattr(request, 'user', None))
        return instance

    def update(self, instance, validated_data):
        request = self.context.get('request')
        instance = super().update(instance, validated_data)
        sync_lending_inventory_transaction(instance, getattr(request, 'user', None))
        return instance
