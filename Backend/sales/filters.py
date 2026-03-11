from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Lending, Sale


class SaleFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    sale_date_from = filters.DateFilter(field_name='sale_date', lookup_expr='gte')
    sale_date_to = filters.DateFilter(field_name='sale_date', lookup_expr='lte')

    class Meta:
        model = Sale
        fields = ['search', 'fuel', 'motor', 'currency', 'sale_date_from', 'sale_date_to']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        query = (
            Q(fuel__fuel_name__icontains=value)
            | Q(fuel__type__icontains=value)
            | Q(motor__motor_name__icontains=value)
            | Q(currency__code__icontains=value)
        )
        if value.isdigit():
            query |= Q(sale_id=int(value))
        return queryset.filter(query)


class LendingFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    sale_date_from = filters.DateFilter(field_name='sale_date', lookup_expr='gte')
    sale_date_to = filters.DateFilter(field_name='sale_date', lookup_expr='lte')
    end_date_from = filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = filters.DateFilter(field_name='end_date', lookup_expr='lte')
    status = filters.ChoiceFilter(choices=Lending.STATUS_CHOICES)

    class Meta:
        model = Lending
        fields = [
            'search',
            'customer',
            'fuel',
            'guarantor',
            'status',
            'sale_date_from',
            'sale_date_to',
            'end_date_from',
            'end_date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        query = (
            Q(customer__first_name__icontains=value)
            | Q(customer__last_name__icontains=value)
            | Q(customer__phone__icontains=value)
            | Q(guarantor__first_name__icontains=value)
            | Q(guarantor__last_name__icontains=value)
            | Q(fuel__fuel_name__icontains=value)
            | Q(fuel__type__icontains=value)
        )
        if value.isdigit():
            query |= Q(lending_id=int(value))
        return queryset.filter(query)

