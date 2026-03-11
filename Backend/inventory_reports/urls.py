from django.urls import path

from .views import FuelMovementReportView, FuelStockSummaryView, TankStatusReportView

app_name = 'inventory_reports'

urlpatterns = [
    path('tank-status/', TankStatusReportView.as_view(), name='tank-status'),
    path('fuel-stock/', FuelStockSummaryView.as_view(), name='fuel-stock'),
    path('movements/', FuelMovementReportView.as_view(), name='fuel-movements'),
]
