from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import (
    AccountFilter,
    CurrencyFilter,
    CurrencyRateFilter,
    ExpenseFilter,
    FinancialTransactionFilter,
    PartnerDebtFilter,
    SalaryFilter,
)
from .models import Account, Currency, CurrencyRate, Expense, FinancialTransaction, PartnerDebt, Salary
from .serializers import (
    AccountSerializer,
    CurrencySerializer,
    CurrencyRateSerializer,
    ExpenseSerializer,
    FinancialTransactionSerializer,
    PartnerDebtSerializer,
    SalarySerializer,
)


class CurrencyViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Currency.objects.all().order_by('code')
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CurrencyFilter
    search_fields = ['code', 'name', 'symbol']
    ordering_fields = ['code', 'name', 'is_base', 'is_active', 'created_at', 'updated_at']
    ordering = ['code']
    pagination_class = StandardResultsSetPagination


class CurrencyRateViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        CurrencyRate.objects.select_related('from_currency', 'to_currency', 'created_by')
        .all()
        .order_by('-date', '-created_at', '-id')
    )
    serializer_class = CurrencyRateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CurrencyRateFilter
    search_fields = [
        'from_currency__code',
        'from_currency__name',
        'to_currency__code',
        'to_currency__name',
        'created_by__first_name',
        'created_by__last_name',
        'created_by__username',
    ]
    ordering_fields = ['id', 'date', 'rate_value', 'created_at']
    ordering = ['-date', '-created_at', '-id']
    pagination_class = StandardResultsSetPagination


class AccountViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Account.objects.select_related('currency').all().order_by('name', 'id')
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AccountFilter
    search_fields = ['name', 'account_type', 'description', 'currency__code', 'currency__name']
    ordering_fields = ['id', 'name', 'account_type', 'is_active', 'description', 'created_at', 'updated_at']
    ordering = ['name', 'id']
    pagination_class = StandardResultsSetPagination


class SalaryViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Salary.objects.select_related('employee', 'employee__user').all().order_by('-pay_date', '-id')
    serializer_class = SalarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SalaryFilter
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'description']
    ordering_fields = ['id', 'year', 'month', 'base_salary', 'bonus', 'net_salary', 'pay_date']
    ordering = ['-pay_date', '-id']
    pagination_class = StandardResultsSetPagination


class ExpenseViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('currency').all().order_by('-pay_date', '-id')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['title', 'description', 'currency__code', 'currency__name']
    ordering_fields = [
        'id',
        'title',
        'amount',
        'currency_rate',
        'amount_in_base_currency',
        'pay_date',
        'created_at',
    ]
    ordering = ['-pay_date', '-id']
    pagination_class = StandardResultsSetPagination


class PartnerDebtViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        PartnerDebt.objects.select_related('partner', 'currency', 'created_by', 'updated_by')
        .prefetch_related('payments', 'payments__currency_paid', 'payments__created_by')
        .all()
        .order_by('-date', '-id')
    )
    serializer_class = PartnerDebtSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PartnerDebtFilter
    search_fields = [
        'partner__first_name',
        'partner__last_name',
        'description',
        'currency__code',
        'created_by__username',
        'updated_by__username',
    ]
    ordering_fields = ['id', 'date', 'amount_money', 'total_in', 'paid_amount', 'created_at']
    ordering = ['-date', '-id']
    pagination_class = StandardResultsSetPagination


class FinancialTransactionViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = (
        FinancialTransaction.objects.select_related(
            'from_account',
            'to_account',
            'currency',
            'created_by',
            'updated_by',
        )
        .all()
        .order_by('-date_time', '-id')
    )
    serializer_class = FinancialTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FinancialTransactionFilter
    search_fields = [
        'description',
        'reference_type',
        'currency__code',
        'from_account__name',
        'to_account__name',
        'created_by__first_name',
        'created_by__last_name',
        'created_by__username',
    ]
    ordering_fields = ['id', 'transaction_type', 'amount', 'date_time', 'created_at']
    ordering = ['-date_time', '-id']
    pagination_class = StandardResultsSetPagination
