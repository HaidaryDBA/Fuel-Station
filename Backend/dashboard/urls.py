from django.urls import path

from .views import DashboardSummaryView, TankInventoryStatusView, TodaySalesByFuelView

app_name = 'dashboard'

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('tank-status/', TankInventoryStatusView.as_view(), name='dashboard-tank-status'),
    path('today-sales/', TodaySalesByFuelView.as_view(), name='dashboard-today-sales'),
]
