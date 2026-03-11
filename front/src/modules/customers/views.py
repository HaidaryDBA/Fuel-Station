from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import CustomerFilter
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'customers'
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

