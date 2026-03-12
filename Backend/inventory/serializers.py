from decimal import Decimal

from rest_framework import serializers

from employees.models import Employee

from .models import Fuel, FuelMotor, InventoryTransaction, PriceHistory, TankStorage

LITERS_PER_TON = Decimal('1000')


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


class FuelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fuel
        fields = ['id', 'fuel_name', 'type']
        read_only_fields = ['id']


class TankStorageSerializer(serializers.ModelSerializer):
    Fuel = serializers.PrimaryKeyRelatedField(queryset=Fuel.objects.all())
    fuel_name = serializers.CharField(source='Fuel.fuel_name', read_only=True)

    class Meta:
        model = TankStorage
        fields = ['id', 'Fuel', 'fuel_name', 'tank_number', 'capacity', 'min_level_alert']
        read_only_fields = ['id', 'fuel_name']

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Capacity must be greater than 0.')
        return value

    def validate_min_level_alert(self, value):
        if value < 0:
            raise serializers.ValidationError('Minimum level alert cannot be negative.')
        return value


class FuelMotorSerializer(serializers.ModelSerializer):
    tank_name = serializers.SerializerMethodField(read_only=True)
    fuel_name = serializers.CharField(source='fuel_id.fuel_name', read_only=True)

    class Meta:
        model = FuelMotor
        fields = ['id', 'tank_id', 'tank_name', 'motor_name', 'fuel_id', 'fuel_name']
        read_only_fields = ['id', 'tank_name', 'fuel_name']

    def get_tank_name(self, obj):
        return f'Tank #{obj.tank_id.tank_number}'

    def validate(self, attrs):
        tank = attrs.get('tank_id', getattr(self.instance, 'tank_id', None))
        fuel = attrs.get('fuel_id', getattr(self.instance, 'fuel_id', None))

        if tank is not None and fuel is not None and tank.Fuel_id != fuel.id:
            raise serializers.ValidationError({'fuel_id': 'Selected fuel must match the tank fuel.'})

        return attrs


class PriceHistorySerializer(serializers.ModelSerializer):
    fuel_name = serializers.CharField(source='fuel.fuel_name', read_only=True)
    end_date = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = PriceHistory
        fields = ['id', 'fuel', 'fuel_name', 'price', 'start_date', 'end_date']
        read_only_fields = ['id', 'fuel_name']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must be 0 or greater.')
        return value

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date cannot be earlier than start date.'})
        return attrs


class InventoryTransactionSerializer(serializers.ModelSerializer):
    tank_name = serializers.SerializerMethodField(read_only=True)
    fuel_name = serializers.CharField(source='fuel_id.fuel_name', read_only=True)
    created_by = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = InventoryTransaction
        fields = [
            'id',
            'tank_id',
            'tank_name',
            'fuel_id',
            'fuel_name',
            'transaction_type',
            'quantity',
            'reference_type',
            'reference_id',
            'date_time',
            'adjustment_direction',
            'created_at',
            'created_by',
            'description',
        ]
        read_only_fields = ['id', 'tank_name', 'fuel_name', 'created_by']

    def get_tank_name(self, obj):
        return f'Tank #{obj.tank_id.tank_number}'

    def get_created_by(self, obj):
        employee = obj.created_at
        if employee is None:
            user = getattr(obj, 'created_by_user', None)
            if user is None:
                return ''
            full_name = user.get_full_name().strip()
            return full_name or user.username
        user = getattr(employee, 'user', None)
        if user is None:
            return str(employee)
        full_name = user.get_full_name().strip()
        return full_name or user.username

    def validate(self, attrs):
        tank = attrs.get('tank_id', getattr(self.instance, 'tank_id', None))
        fuel = attrs.get('fuel_id', getattr(self.instance, 'fuel_id', None))
        transaction_type = attrs.get('transaction_type', getattr(self.instance, 'transaction_type', None))
        adjustment_direction = attrs.get(
            'adjustment_direction',
            getattr(self.instance, 'adjustment_direction', None),
        )
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', None))

        if tank is not None and fuel is not None and tank.Fuel_id != fuel.id:
            raise serializers.ValidationError({'fuel_id': 'Selected fuel must match the tank fuel.'})

        if transaction_type == 'adjustment' and not adjustment_direction:
            raise serializers.ValidationError(
                {'adjustment_direction': 'Adjustment direction is required for adjustment transactions.'}
            )

        if transaction_type != 'adjustment':
            attrs['adjustment_direction'] = None

        if tank is not None and quantity is not None:
            is_incoming = transaction_type in ['purchase_in', 'return_in'] or (
                transaction_type == 'adjustment' and adjustment_direction == 'in'
            )
            is_outgoing = transaction_type in ['sale_out', 'lending_out'] or (
                transaction_type == 'adjustment' and adjustment_direction == 'out'
            )
            if is_incoming:
                current_liters = tank.get_current_liters(
                    exclude_transaction_id=getattr(self.instance, 'pk', None)
                )
                capacity_liters = Decimal(tank.capacity) * LITERS_PER_TON
                incoming_liters = abs(Decimal(quantity))
                if current_liters + incoming_liters > capacity_liters:
                    raise serializers.ValidationError(
                        {'quantity': 'This transaction exceeds the tank capacity.'}
                    )
            if is_outgoing:
                current_liters = tank.get_current_liters(
                    exclude_transaction_id=getattr(self.instance, 'pk', None)
                )
                outgoing_liters = abs(Decimal(quantity))
                if current_liters - outgoing_liters < 0:
                    raise serializers.ValidationError(
                        {'quantity': 'This transaction would make the tank inventory negative.'}
                    )

        return attrs

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than 0.')
        return value

    def validate_reference_id(self, value):
        if value <= 0:
            raise serializers.ValidationError('Reference ID must be greater than 0.')
        return value

    def create(self, validated_data):
        user = getattr(self.context.get('request'), 'user', None)
        employee = getattr(user, 'employee_profile', None) if user is not None else None
        if validated_data.get('created_at') is None:
            validated_data['created_at'] = employee
        if user is not None and getattr(user, 'is_authenticated', False):
            validated_data['created_by_user'] = user
        return super().create(validated_data)
