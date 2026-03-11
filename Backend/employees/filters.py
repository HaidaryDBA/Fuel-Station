from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Customer, Employee, Partners


class EmployeeFilter(filters.FilterSet):
    role_name = filters.CharFilter(field_name='user__role_name', lookup_expr='iexact')
    status = filters.ChoiceFilter(field_name='status', choices=Employee.STATUS_CHOICES)
    membership_type = filters.ChoiceFilter(field_name='membership_type', choices=Employee.MEMBERSHIP_CHOICES)
    join_date_from = filters.DateFilter(field_name='join_date', lookup_expr='gte')
    join_date_to = filters.DateFilter(field_name='join_date', lookup_expr='lte')
    min_salary = filters.NumberFilter(field_name='salary', lookup_expr='gte')
    max_salary = filters.NumberFilter(field_name='salary', lookup_expr='lte')

    class Meta:
        model = Employee
        fields = [
            'role_name',
            'status',
            'membership_type',
            'join_date_from',
            'join_date_to',
            'min_salary',
            'max_salary',
        ]


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


class PartnerFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    join_date_from = filters.DateFilter(field_name='Join_date', lookup_expr='gte')
    join_date_to = filters.DateFilter(field_name='Join_date', lookup_expr='lte')
    min_share = filters.NumberFilter(field_name='share_percentage', lookup_expr='gte')
    max_share = filters.NumberFilter(field_name='share_percentage', lookup_expr='lte')

    class Meta:
        model = Partners
        fields = [
            'search',
            'join_date_from',
            'join_date_to',
            'min_share',
            'max_share',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(father_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(mean_address__icontains=value)
            | Q(current_address__icontains=value)
        )
