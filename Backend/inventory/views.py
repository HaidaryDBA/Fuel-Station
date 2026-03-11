from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination

from .filters import (
    FuelFilter,
    FuelMotorFilter,
    InventoryTransactionFilter,
    PriceHistoryFilter,
    TankStorageFilter,
)
from .models import Fuel, FuelMotor, InventoryTransaction, PriceHistory, TankStorage
from .serializers import (
    FuelMotorSerializer,
    FuelSerializer,
    InventoryTransactionSerializer,
    PriceHistorySerializer,
    TankStorageSerializer,
)


class FuelViewSet(viewsets.ModelViewSet):
    queryset = Fuel.objects.all().order_by('-id')
    serializer_class = FuelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FuelFilter
    search_fields = ['fuel_name', 'type']
    ordering_fields = ['id', 'fuel_name', 'type']
    ordering = ['-id']
    pagination_class = StandardResultsSetPagination


class TankStorageViewSet(viewsets.ModelViewSet):
    queryset = TankStorage.objects.select_related('Fuel').all().order_by('-id')
    serializer_class = TankStorageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TankStorageFilter
    search_fields = ['Fuel__fuel_name', 'Fuel__type']
    ordering_fields = ['id', 'tank_number', 'capacity', 'min_level_alert']
    ordering = ['-id']
    pagination_class = StandardResultsSetPagination


class FuelMotorViewSet(viewsets.ModelViewSet):
    queryset = (
        FuelMotor.objects.select_related('tank_id', 'tank_id__Fuel', 'fuel_id')
        .all()
        .order_by('-id')
    )
    serializer_class = FuelMotorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FuelMotorFilter
    search_fields = ['motor_name', 'fuel_id__fuel_name', 'fuel_id__type']
    ordering_fields = ['id', 'motor_name', 'tank_id__tank_number', 'fuel_id__fuel_name']
    ordering = ['-id']
    pagination_class = StandardResultsSetPagination


class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.select_related('fuel').all().order_by('-id')
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PriceHistoryFilter
    search_fields = ['fuel__fuel_name', 'fuel__type']
    ordering_fields = ['id', 'price', 'start_date', 'end_date']
    ordering = ['-id']
    pagination_class = StandardResultsSetPagination


class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = (
        InventoryTransaction.objects.select_related(
            'tank_id',
            'tank_id__Fuel',
            'fuel_id',
            'created_at',
            'created_at__user',
            'created_by_user',
        )
        .all()
        .order_by('-date_time', '-id')
    )
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InventoryTransactionFilter
    search_fields = ['description', 'fuel_id__fuel_name']
    ordering_fields = ['id', 'date_time', 'quantity', 'transaction_type']
    ordering = ['-date_time', '-id']
    pagination_class = StandardResultsSetPagination
