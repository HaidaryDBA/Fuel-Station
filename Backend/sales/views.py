from decimal import Decimal

from django.db.models import Count, DecimalField, Sum, Value
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from financial.models import Currency
from inventory.sync import delete_inventory_transaction

from .filters import LendingFilter, SaleFilter
from .models import Lending, Sale
from .serializers import LendingSerializer, SaleSerializer


class SaleViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        Sale.objects.select_related('fuel', 'motor', 'currency')
        .all()
        .order_by('-sale_date', '-sale_id')
    )
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'sales'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SaleFilter
    search_fields = ['fuel__fuel_name', 'fuel__type', 'motor__motor_name', 'currency__code']
    ordering_fields = [
        'sale_id',
        'sale_date',
        'amount',
        'unit_price',
        'total_amount_value',
        'total_amount_in_base_currency',
        'created_at',
    ]
    ordering = ['-sale_date', '-sale_id']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        delete_inventory_transaction(
            reference_type='sale',
            reference_id=instance.sale_id,
            transaction_type='sale_out',
        )
        super().perform_destroy(instance)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        totals = queryset.aggregate(
            count=Count('sale_id'),
            total_quantity=Coalesce(
                Sum('amount'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_amount=Coalesce(
                Sum('total_amount_value'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_amount_in_base_currency=Coalesce(
                Sum('total_amount_in_base_currency'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )
        base_currency = Currency.objects.filter(is_base=True).first()

        return Response(
            {
                'count': totals['count'],
                'total_quantity': str(totals['total_quantity']),
                'total_amount': str(totals['total_amount']),
                'total_amount_in_base_currency': str(totals['total_amount_in_base_currency']),
                'base_currency_code': base_currency.code if base_currency is not None else '',
            }
        )


class LendingViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        Lending.objects.select_related('customer', 'fuel', 'tank_id', 'tank_id__Fuel', 'guarantor')
        .all()
        .order_by('-sale_date', '-lending_id')
    )
    serializer_class = LendingSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'sales'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LendingFilter
    search_fields = [
        'customer__first_name',
        'customer__last_name',
        'customer__phone',
        'guarantor__first_name',
        'guarantor__last_name',
        'fuel__fuel_name',
    ]
    ordering_fields = [
        'lending_id',
        'sale_date',
        'end_date',
        'amount',
        'unit_price',
        'discount',
        'paid_amount',
        'total_amount_value',
        'remaining_amount_value',
        'created_at',
    ]
    ordering = ['-sale_date', '-lending_id']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        delete_inventory_transaction(
            reference_type='lending',
            reference_id=instance.lending_id,
            transaction_type='lending_out',
        )
        super().perform_destroy(instance)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        totals = queryset.aggregate(
            count=Count('lending_id'),
            total_amount=Coalesce(
                Sum('total_amount_value'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_discount=Coalesce(
                Sum('discount'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_paid=Coalesce(
                Sum('paid_amount'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
            total_remaining=Coalesce(
                Sum('remaining_amount_value'),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=18, decimal_places=2),
            ),
        )

        return Response(
            {
                'count': totals['count'],
                'total_amount': str(totals['total_amount']),
                'total_discount': str(totals['total_discount']),
                'total_paid': str(totals['total_paid']),
                'total_remaining': str(totals['total_remaining']),
                'paid_count': queryset.filter(status=Lending.STATUS_PAID).count(),
                'overdue_count': queryset.filter(status=Lending.STATUS_OVERDUE).count(),
            }
        )
