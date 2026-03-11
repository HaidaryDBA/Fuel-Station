from django.urls import path

from .views import AccountBalanceReportView, MoneyFlowReportView

app_name = 'finance_reports'

urlpatterns = [
    path('account-balances/', AccountBalanceReportView.as_view(), name='account-balances'),
    path('money-flow/', MoneyFlowReportView.as_view(), name='money-flow'),
]
