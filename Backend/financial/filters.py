from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Account, Currency, CurrencyRate, Expense, FinancialTransaction, PartnerDebt, Salary


class CurrencyFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Currency
        fields = ['search', 'is_base', 'is_active']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(code__icontains=value) | Q(name__icontains=value) | Q(symbol__icontains=value)
        )


class CurrencyRateFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = CurrencyRate
        fields = [
            'search',
            'from_currency',
            'to_currency',
            'date',
            'date_from',
            'date_to',
            'created_by',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(from_currency__code__icontains=value)
            | Q(from_currency__name__icontains=value)
            | Q(to_currency__code__icontains=value)
            | Q(to_currency__name__icontains=value)
            | Q(created_by__first_name__icontains=value)
            | Q(created_by__last_name__icontains=value)
            | Q(created_by__username__icontains=value)
        )


class AccountFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Account
        fields = ['search', 'account_type', 'currency', 'is_active']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(name__icontains=value)
            | Q(account_type__icontains=value)
            | Q(description__icontains=value)
            | Q(currency__code__icontains=value)
            | Q(currency__name__icontains=value)
        )


class SalaryFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    min_year = filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_month = filters.NumberFilter(field_name='month', lookup_expr='gte')
    max_month = filters.NumberFilter(field_name='month', lookup_expr='lte')
    min_net_salary = filters.NumberFilter(field_name='net_salary', lookup_expr='gte')
    max_net_salary = filters.NumberFilter(field_name='net_salary', lookup_expr='lte')
    pay_date_from = filters.DateFilter(field_name='pay_date', lookup_expr='gte')
    pay_date_to = filters.DateFilter(field_name='pay_date', lookup_expr='lte')

    class Meta:
        model = Salary
        fields = [
            'search',
            'employee',
            'year',
            'month',
            'min_year',
            'max_year',
            'min_month',
            'max_month',
            'min_net_salary',
            'max_net_salary',
            'pay_date_from',
            'pay_date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(employee__user__first_name__icontains=value)
            | Q(employee__user__last_name__icontains=value)
            | Q(description__icontains=value)
        )


class ExpenseFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    pay_date_from = filters.DateFilter(field_name='pay_date', lookup_expr='gte')
    pay_date_to = filters.DateFilter(field_name='pay_date', lookup_expr='lte')

    class Meta:
        model = Expense
        fields = [
            'search',
            'currency',
            'pay_date_from',
            'pay_date_to',
            'min_amount',
            'max_amount',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value)
            | Q(description__icontains=value)
            | Q(currency__code__icontains=value)
            | Q(currency__name__icontains=value)
        )


class PartnerDebtFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    min_amount = filters.NumberFilter(field_name='amount_money', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount_money', lookup_expr='lte')
    min_paid_amount = filters.NumberFilter(field_name='paid_amount', lookup_expr='gte')
    max_paid_amount = filters.NumberFilter(field_name='paid_amount', lookup_expr='lte')
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')
    paid_date_from = filters.DateFilter(field_name='paid_date', lookup_expr='gte')
    paid_date_to = filters.DateFilter(field_name='paid_date', lookup_expr='lte')

    class Meta:
        model = PartnerDebt
        fields = [
            'search',
            'partner',
            'currency',
            'date_from',
            'date_to',
            'paid_date_from',
            'paid_date_to',
            'min_amount',
            'max_amount',
            'min_paid_amount',
            'max_paid_amount',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(partner__first_name__icontains=value)
            | Q(partner__last_name__icontains=value)
            | Q(description__icontains=value)
            | Q(currency__code__icontains=value)
        )


class FinancialTransactionFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    date_from = filters.DateTimeFilter(field_name='date_time', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='date_time', lookup_expr='lte')

    class Meta:
        model = FinancialTransaction
        fields = [
            'search',
            'transaction_type',
            'currency',
            'from_account',
            'to_account',
            'reference_type',
            'date_from',
            'date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(description__icontains=value)
            | Q(reference_type__icontains=value)
            | Q(currency__code__icontains=value)
            | Q(from_account__name__icontains=value)
            | Q(to_account__name__icontains=value)
            | Q(created_by__first_name__icontains=value)
            | Q(created_by__last_name__icontains=value)
            | Q(created_by__username__icontains=value)
        )
