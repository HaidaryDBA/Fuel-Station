from django.urls import path

from .views import (
    AccountBalancesReportView,
    DueSoonLendingsReportView,
    OutstandingLendingsReportView,
    PurchaseSummaryReportView,
    ReportCsvExportView,
    ReportsOverviewView,
    SalesDailyReportView,
    TankStockReportView,
)

app_name = 'reports'

urlpatterns = [
    path('overview/', ReportsOverviewView.as_view(), name='overview'),
    path('inventory/stock/', TankStockReportView.as_view(), name='inventory-stock'),
    path('finance/account-balances/', AccountBalancesReportView.as_view(), name='account-balances'),
    path('sales/daily/', SalesDailyReportView.as_view(), name='sales-daily'),
    path('lendings/outstanding/', OutstandingLendingsReportView.as_view(), name='lendings-outstanding'),
    path('lendings/due-soon/', DueSoonLendingsReportView.as_view(), name='lendings-due-soon'),
    path('purchases/summary/', PurchaseSummaryReportView.as_view(), name='purchases-summary'),
    path('exports/<str:report_key>/csv/', ReportCsvExportView.as_view(), name='report-csv-export'),
]
