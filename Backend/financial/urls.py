from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    CurrencyRateViewSet,
    CurrencyViewSet,
    ExpenseViewSet,
    FinancialTransactionViewSet,
    PartnerDebtViewSet,
    SalaryViewSet,
)

app_name = 'financial'

router = DefaultRouter()
router.register(r'currencies', CurrencyViewSet, basename='currency')
router.register(r'currency-rates', CurrencyRateViewSet, basename='currency-rate')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'salaries', SalaryViewSet, basename='salary')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'partner-debts', PartnerDebtViewSet, basename='partner-debt')
router.register(r'transactions', FinancialTransactionViewSet, basename='financial-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
