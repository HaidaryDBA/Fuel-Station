from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Fuel, FuelMotor, InventoryTransaction, PriceHistory, TankStorage


class FuelFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Fuel
        fields = ['search', 'type']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(fuel_name__icontains=value) | Q(type__icontains=value))


class TankStorageFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    fuel = filters.NumberFilter(field_name='Fuel')
    min_capacity = filters.NumberFilter(field_name='capacity', lookup_expr='gte')
    max_capacity = filters.NumberFilter(field_name='capacity', lookup_expr='lte')

    class Meta:
        model = TankStorage
        fields = ['search', 'fuel', 'tank_number', 'min_capacity', 'max_capacity']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        base_q = (
            Q(Fuel__fuel_name__icontains=value)
            | Q(Fuel__type__icontains=value)
        )
        if value.isdigit():
            base_q |= Q(tank_number=int(value))
        return queryset.filter(base_q)


class FuelMotorFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    tank_id = filters.NumberFilter(field_name='tank_id')
    fuel_id = filters.NumberFilter(field_name='fuel_id')

    class Meta:
        model = FuelMotor
        fields = ['search', 'tank_id', 'fuel_id']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        base_q = (
            Q(motor_name__icontains=value)
            | Q(fuel_id__fuel_name__icontains=value)
            | Q(fuel_id__type__icontains=value)
        )
        if value.isdigit():
            base_q |= Q(tank_id__tank_number=int(value))
        return queryset.filter(base_q)


class PriceHistoryFilter(filters.FilterSet):
    fuel = filters.NumberFilter(field_name='fuel')
    start_date_from = filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = filters.DateFilter(field_name='end_date', lookup_expr='lte')

    class Meta:
        model = PriceHistory
        fields = [
            'fuel',
            'start_date_from',
            'start_date_to',
            'end_date_from',
            'end_date_to',
        ]


class InventoryTransactionFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    transaction_type = filters.ChoiceFilter(
        field_name='transaction_type',
        choices=InventoryTransaction.TRANSACTION_TYPE_CHOICES,
    )
    reference_type = filters.ChoiceFilter(
        field_name='reference_type',
        choices=InventoryTransaction.REFERENCE_CHOICES,
    )
    tank_id = filters.NumberFilter(field_name='tank_id')
    fuel_id = filters.NumberFilter(field_name='fuel_id')
    date_from = filters.DateTimeFilter(field_name='date_time', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='date_time', lookup_expr='lte')

    class Meta:
        model = InventoryTransaction
        fields = [
            'search',
            'transaction_type',
            'reference_type',
            'tank_id',
            'fuel_id',
            'date_from',
            'date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        base_q = (
            Q(description__icontains=value)
            | Q(fuel_id__fuel_name__icontains=value)
        )
        if value.isdigit():
            numeric_value = int(value)
            base_q |= Q(tank_id__tank_number=numeric_value)
            base_q |= Q(reference_id=numeric_value)
        return queryset.filter(base_q)
