from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from financial.models import Currency, CurrencyRate
from inventory.sync import sync_order_purchase_inventory_transaction

from .models import OrderPurchase, Purchase, Supplier


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


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


class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id',
            'supplier_id',
            'supplier_name',
            'phone',
            'address',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'supplier_id', 'created_at', 'updated_at']


class PurchaseSerializer(CurrencyRateResolutionMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    fuel_name = serializers.CharField(source='fuel.fuel_name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.supplier_name', read_only=True)
    partner_name = serializers.SerializerMethodField(read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    currency_rate = serializers.DecimalField(max_digits=18, decimal_places=6, read_only=True)
    base_currency_code = serializers.SerializerMethodField(read_only=True)
    paid_currency_code = serializers.CharField(source='paid_currency.code', read_only=True)
    paid_currency_rate = serializers.DecimalField(max_digits=18, decimal_places=6, read_only=True)
    weight_kg = serializers.SerializerMethodField(read_only=True)
    total_liter = serializers.SerializerMethodField(read_only=True)
    total_amount = serializers.SerializerMethodField(read_only=True)
    total_amount_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    paid_amount_in_purchase_currency = serializers.SerializerMethodField(read_only=True)
    paid_amount_in_base_currency = serializers.SerializerMethodField(read_only=True)
    remaining_amount = serializers.SerializerMethodField(read_only=True)
    remaining_amount_in_base_currency = serializers.SerializerMethodField(read_only=True)
    payment_status = serializers.SerializerMethodField(read_only=True)
    status_label = serializers.SerializerMethodField(read_only=True)
    pay_date = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = Purchase
        fields = [
            'id',
            'purchase_id',
            'fuel',
            'fuel_name',
            'supplier',
            'supplier_name',
            'partner',
            'partner_name',
            'purchase_date',
            'amount_ton',
            'density',
            'weight_kg',
            'total_liter',
            'unit_price',
            'total_amount',
            'currency',
            'currency_code',
            'currency_rate',
            'base_currency_code',
            'total_amount_in_base_currency',
            'invoice_number',
            'paid_currency',
            'paid_currency_code',
            'paid_currency_rate',
            'paid_amount',
            'paid_amount_in_purchase_currency',
            'paid_amount_in_base_currency',
            'pay_date',
            'remaining_amount',
            'remaining_amount_in_base_currency',
            'payment_status',
            'status_label',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'purchase_id',
            'fuel_name',
            'supplier_name',
            'partner_name',
            'currency_code',
            'weight_kg',
            'total_liter',
            'total_amount',
            'remaining_amount',
            'payment_status',
            'status_label',
            'currency_rate',
            'base_currency_code',
            'total_amount_in_base_currency',
            'paid_currency_code',
            'paid_currency_rate',
            'paid_amount_in_purchase_currency',
            'paid_amount_in_base_currency',
            'remaining_amount_in_base_currency',
            'created_at',
            'updated_at',
        ]

    def get_partner_name(self, obj):
        return f'{obj.partner.first_name} {obj.partner.last_name}'.strip()

    def get_weight_kg(self, obj):
        return str(obj.weight_kg)

    def get_base_currency_code(self, obj):
        base_currency = self._get_base_currency()
        return base_currency.code if base_currency is not None else ''

    def get_total_liter(self, obj):
        return str(obj.total_liter)

    def get_total_amount(self, obj):
        return str(obj.total_amount)

    def get_paid_amount_in_purchase_currency(self, obj):
        return str(obj.paid_amount_in_purchase_currency)

    def get_paid_amount_in_base_currency(self, obj):
        return str(obj.paid_amount_in_base_currency)

    def get_remaining_amount(self, obj):
        return str(obj.remaining_amount)

    def get_remaining_amount_in_base_currency(self, obj):
        return str(obj.remaining_amount_in_base_currency)

    def get_payment_status(self, obj):
        return obj.payment_status

    def get_status_label(self, obj):
        return obj.status_label

    def validate(self, attrs):
        purchase_date = attrs.get('purchase_date', getattr(self.instance, 'purchase_date', None))
        pay_date = attrs.get('pay_date', getattr(self.instance, 'pay_date', None))
        amount_ton = attrs.get('amount_ton', getattr(self.instance, 'amount_ton', Decimal('0.00')))
        unit_price = attrs.get('unit_price', getattr(self.instance, 'unit_price', Decimal('0.00')))
        paid_amount = attrs.get('paid_amount', getattr(self.instance, 'paid_amount', Decimal('0.00')))
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        paid_currency = attrs.get('paid_currency', getattr(self.instance, 'paid_currency', currency))

        today = timezone.localdate()
        if purchase_date is not None and purchase_date > today:
            raise serializers.ValidationError({'purchase_date': ['Purchase date cannot be in the future.']})

        if pay_date is not None and pay_date > today:
            raise serializers.ValidationError({'pay_date': ['Pay date cannot be in the future.']})

        if purchase_date is not None and pay_date is not None and pay_date < purchase_date:
            raise serializers.ValidationError({'pay_date': ['Pay date cannot be earlier than purchase date.']})

        if paid_amount > Decimal('0.00') and pay_date is None:
            raise serializers.ValidationError({'pay_date': ['Pay date is required when a payment is recorded.']})

        if currency is None:
            return attrs

        if paid_currency is None:
            paid_currency = currency

        base_currency = self._get_base_currency()
        if base_currency is None:
            raise serializers.ValidationError({'currency_rate': ['No base currency is configured.']})

        total_amount = (amount_ton * unit_price).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )
        purchase_to_base_rate = self._resolve_latest_currency_rate(currency, base_currency, 'currency_rate')
        paid_to_base_rate = self._resolve_latest_currency_rate(paid_currency, base_currency, 'paid_currency_rate')

        total_amount_in_base_currency = (total_amount * purchase_to_base_rate).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )
        paid_amount_in_base_currency = (paid_amount * paid_to_base_rate).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )
        if paid_amount_in_base_currency > total_amount_in_base_currency:
            raise serializers.ValidationError(
                {
                    'paid_amount': [
                        'Paid amount cannot exceed total purchase amount after currency conversion.'
                    ]
                }
            )

        if purchase_to_base_rate == Decimal('0.000000'):
            raise serializers.ValidationError({'currency_rate': ['Purchase currency rate cannot be zero.']})

        if currency.pk == paid_currency.pk:
            paid_to_purchase_rate = Decimal('1.000000')
            paid_amount_in_purchase_currency = paid_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            paid_to_purchase_rate = (paid_to_base_rate / purchase_to_base_rate).quantize(
                Decimal('0.000001'),
                rounding=ROUND_HALF_UP,
            )
            paid_amount_in_purchase_currency = (paid_amount_in_base_currency / purchase_to_base_rate).quantize(
                Decimal('0.01'),
                rounding=ROUND_HALF_UP,
            )

        remaining_amount_in_base_currency = max(
            total_amount_in_base_currency - paid_amount_in_base_currency,
            Decimal('0.00'),
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        remaining_amount = max(
            total_amount - paid_amount_in_purchase_currency,
            Decimal('0.00'),
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        attrs['paid_currency'] = paid_currency
        attrs['currency_rate'] = purchase_to_base_rate
        attrs['paid_currency_rate'] = paid_to_purchase_rate
        attrs['total_amount_value'] = total_amount
        attrs['total_amount_in_base_currency'] = total_amount_in_base_currency
        attrs['paid_amount_in_purchase_currency_value'] = paid_amount_in_purchase_currency
        attrs['paid_amount_in_base_currency_value'] = paid_amount_in_base_currency
        attrs['remaining_amount_value'] = remaining_amount
        attrs['remaining_amount_in_base_currency_value'] = remaining_amount_in_base_currency

        return attrs


class OrderPurchaseSerializer(CurrencyRateResolutionMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    supplier_name = serializers.CharField(source='supplier.supplier_name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    currency_rate = serializers.DecimalField(max_digits=18, decimal_places=6, read_only=True)
    base_currency_code = serializers.SerializerMethodField(read_only=True)
    currency_cost = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    tanker_name = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    density_per_ton = serializers.SerializerMethodField(read_only=True)
    total_liter = serializers.SerializerMethodField(read_only=True)
    estimated_total_cost = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderPurchase
        fields = [
            'id',
            'order_purchase_id',
            'order_id',
            'supplier',
            'supplier_name',
            'amount_per_ton',
            'density',
            'density_per_ton',
            'total_liter',
            'purchase_price',
            'currency',
            'currency_code',
            'currency_rate',
            'base_currency_code',
            'currency_cost',
            'transport_cost',
            'estimated_total_cost',
            'tanker',
            'tanker_name',
            'date',
            'created_by',
            'created_by_name',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'order_purchase_id',
            'order_id',
            'supplier_name',
            'currency_code',
            'currency_rate',
            'base_currency_code',
            'currency_cost',
            'density_per_ton',
            'total_liter',
            'estimated_total_cost',
            'tanker_name',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

    def get_tanker_name(self, obj):
        fuel_name = getattr(obj.tanker.Fuel, 'fuel_name', f'Fuel #{obj.tanker.Fuel_id}')
        return f'Tank #{obj.tanker.tank_number} ({fuel_name})'

    def get_created_by_name(self, obj):
        full_name = obj.created_by.get_full_name().strip()
        return full_name or obj.created_by.username

    def get_base_currency_code(self, obj):
        base_currency = self._get_base_currency()
        return base_currency.code if base_currency is not None else ''

    def get_density_per_ton(self, obj):
        return str(obj.density_per_ton)

    def get_total_liter(self, obj):
        return str(obj.total_liter)

    def get_estimated_total_cost(self, obj):
        return str(obj.estimated_total_cost)

    def validate(self, attrs):
        order_date = attrs.get('date', getattr(self.instance, 'date', None))
        amount_per_ton = attrs.get('amount_per_ton', getattr(self.instance, 'amount_per_ton', Decimal('0.00')))
        purchase_price = attrs.get('purchase_price', getattr(self.instance, 'purchase_price', Decimal('0.00')))
        transport_cost = attrs.get('transport_cost', getattr(self.instance, 'transport_cost', Decimal('0.00')))
        currency = attrs.get('currency', getattr(self.instance, 'currency', None))
        today = timezone.localdate()

        if order_date is not None and order_date > today:
            raise serializers.ValidationError({'date': ['Order purchase date cannot be in the future.']})

        if currency is None:
            return attrs

        base_currency = self._get_base_currency()
        if base_currency is None:
            raise serializers.ValidationError({'currency_rate': ['No base currency is configured.']})

        estimated_total_cost = ((amount_per_ton * purchase_price) + transport_cost).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )
        currency_rate = self._resolve_latest_currency_rate(currency, base_currency, 'currency_rate')
        currency_cost = (estimated_total_cost * currency_rate).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP,
        )

        attrs['currency_rate'] = currency_rate
        attrs['currency_cost'] = currency_cost

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError({'created_by': ['Authenticated user is required.']})

        validated_data['created_by'] = user
        instance = super().create(validated_data)
        sync_order_purchase_inventory_transaction(instance, user)
        return instance

    def update(self, instance, validated_data):
        request = self.context.get('request')
        instance = super().update(instance, validated_data)
        sync_order_purchase_inventory_transaction(instance, getattr(request, 'user', None))
        return instance
