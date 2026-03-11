from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from inventory.sync import delete_inventory_transaction

from .filters import OrderPurchaseFilter, PurchaseFilter, SupplierFilter
from .models import OrderPurchase, Purchase, Supplier
from .serializers import OrderPurchaseSerializer, PurchaseSerializer, SupplierSerializer


class SupplierViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('supplier_name', 'supplier_id')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'purchases'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SupplierFilter
    search_fields = ['supplier_name', 'phone', 'address', 'description']
    ordering_fields = ['supplier_id', 'supplier_name', 'phone', 'created_at']
    ordering = ['supplier_name', 'supplier_id']
    pagination_class = StandardResultsSetPagination

    def destroy(self, request, *args, **kwargs):
        supplier = self.get_object()
        if supplier.purchases.count()> 0:
            from rest_framework import serializers
            raise serializers.ValidationError('con not delete supplier with purchases')
        return super().destroy(request, *args, **kwargs)
    
    
class PurchaseViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        Purchase.objects.select_related('fuel', 'supplier', 'partner', 'currency', 'paid_currency')
        .all()
        .order_by('-purchase_date', '-purchase_id')
    )
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'purchases'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PurchaseFilter
    search_fields = [
        'invoice_number',
        'fuel__fuel_name',
        'supplier__supplier_name',
        'partner__first_name',
        'partner__last_name',
    ]
    ordering_fields = [
        'purchase_id',
        'purchase_date',
        'amount_ton',
        'unit_price',
        'total_amount_value',
        'currency_rate',
        'total_amount_in_base_currency',
        'paid_amount_in_purchase_currency_value',
        'remaining_amount_value',
        'created_at',
    ]
    ordering = ['-purchase_date', '-purchase_id']
    pagination_class = StandardResultsSetPagination


class OrderPurchaseViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        OrderPurchase.objects.select_related(
            'supplier',
            'currency',
            'tanker',
            'tanker__Fuel',
            'created_by',
        )
        .all()
        .order_by('-date', '-order_purchase_id')
    )
    serializer_class = OrderPurchaseSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'purchases'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderPurchaseFilter
    search_fields = ['description', 'supplier__supplier_name', 'created_by__username']
    ordering_fields = [
        'order_purchase_id',
        'order_id',
        'date',
        'amount_per_ton',
        'purchase_price',
        'transport_cost',
        'created_at',
    ]
    ordering = ['-date', '-order_purchase_id']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        delete_inventory_transaction(
            reference_type='purchase',
            reference_id=instance.order_purchase_id,
            transaction_type='purchase_in',
        )
        super().perform_destroy(instance)
