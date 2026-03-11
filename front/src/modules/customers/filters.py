from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Customer


class CustomerFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    min_total_purchases = filters.NumberFilter(field_name='total_purchases', lookup_expr='gte')
    max_total_purchases = filters.NumberFilter(field_name='total_purchases', lookup_expr='lte')

    class Meta:
        model = Customer
        fields = ['search', 'gender', 'is_active', 'min_total_purchases', 'max_total_purchases']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(email__icontains=value)
            | Q(address__icontains=value)
        )

