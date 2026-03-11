from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.deletion import ProtectedError
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import CustomerFilter, EmployeeFilter, PartnerFilter
from .models import Customer, Employee, Partners
from .serializers import (
    CustomerSerializer,
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeWriteSerializer,
    PartnerSerializer,
)


class EmployeeViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user').all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    permission_module = 'employees'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = [
        'user__first_name',
        'user__last_name',
        'father_name',
        'user__phone',
    ]
    ordering_fields = ['join_date', 'salary', 'created_at', 'updated_at']
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        if self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        read_serializer = EmployeeDetailSerializer(serializer.instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        read_serializer = EmployeeDetailSerializer(serializer.instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        from financial.models import Salary

        if Salary.all_objects.filter(employee=instance).exists():
            raise ValidationError({'detail': 'Cannot delete employee because salary records already exist.'})

        user = instance.user
        user.is_active = False
        user.save(update_fields=['is_active'])
        super().perform_destroy(instance)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        employee = self.get_object()
        employee.status = Employee.STATUS_ACTIVE
        employee.save(update_fields=['status', 'updated_at'])

        user = employee.user
        user.is_active = True
        user.save(update_fields=['is_active'])

        serializer = EmployeeDetailSerializer(employee, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        employee = self.get_object()
        employee.status = Employee.STATUS_INACTIVE
        employee.save(update_fields=['status', 'updated_at'])

        user = employee.user
        user.is_active = False
        user.save(update_fields=['is_active'])

        serializer = EmployeeDetailSerializer(employee, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class CustomerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'employees'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['first_name', 'last_name', 'phone', 'email', 'address']
    ordering_fields = [
        'first_name',
        'last_name',
        'total_purchases',
        'discount_percent',
        'created_at',
        'updated_at',
    ]
    pagination_class = StandardResultsSetPagination


class PartnerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Partners.objects.all().order_by('id')
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'employees'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PartnerFilter
    search_fields = [
        'first_name',
        'father_name',
        'last_name',
        'phone',
        'mean_address',
        'current_address',
    ]
    ordering_fields = ['first_name', 'last_name', 'share_percentage', 'Join_date', 'id']
    ordering = ['id']
    pagination_class = StandardResultsSetPagination

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError(
                {'detail': 'Cannot delete partner because partner debt records already exist.'}
            )
