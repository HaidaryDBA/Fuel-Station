from django.urls import path

from .views import DailySalesReportView, MonthlySalesSummaryView, SalesByFuelTypeView

app_name = 'sales_reports'

urlpatterns = [
    path('daily/', DailySalesReportView.as_view(), name='daily-sales'),
    path('monthly-summary/', MonthlySalesSummaryView.as_view(), name='monthly-sales-summary'),
    path('by-fuel/', SalesByFuelTypeView.as_view(), name='sales-by-fuel'),
]
