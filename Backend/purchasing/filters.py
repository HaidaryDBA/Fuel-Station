from decimal import Decimal

from django.db.models import Q
from django_filters import rest_framework as filters

from .models import OrderPurchase, Purchase, Supplier


class SupplierFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Supplier
        fields = ['search']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(supplier_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(address__icontains=value)
            | Q(description__icontains=value)
        )


class PurchaseFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    payment_status = filters.ChoiceFilter(
        choices=[('completed', 'Completed'), ('remaining', 'Remaining')],
        method='filter_payment_status',
    )
    purchase_date_from = filters.DateFilter(field_name='purchase_date', lookup_expr='gte')
    purchase_date_to = filters.DateFilter(field_name='purchase_date', lookup_expr='lte')

    class Meta:
        model = Purchase
        fields = [
            'search',
            'fuel',
            'supplier',
            'partner',
            'currency',
            'paid_currency',
            'payment_status',
            'purchase_date_from',
            'purchase_date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(invoice_number__icontains=value)
            | Q(supplier__supplier_name__icontains=value)
            | Q(fuel__fuel_name__icontains=value)
            | Q(partner__first_name__icontains=value)
            | Q(partner__last_name__icontains=value)
        )

    def filter_payment_status(self, queryset, name, value):
        if value == 'completed':
            return queryset.filter(remaining_amount_value=Decimal('0.00'))
        if value == 'remaining':
            return queryset.filter(remaining_amount_value__gt=Decimal('0.00'))
        return queryset



class OrderPurchaseFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')
    date_from = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = OrderPurchase
        fields = [
            'search',
            'order_id',
            'supplier',
            'currency',
            'tanker',
            'created_by',
            'date_from',
            'date_to',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        query = (
            Q(supplier__supplier_name__icontains=value)
            | Q(description__icontains=value)
            | Q(created_by__username__icontains=value)
        )
        if value.isdigit():
            query |= Q(order_id=int(value))
        return queryset.filter(query)
