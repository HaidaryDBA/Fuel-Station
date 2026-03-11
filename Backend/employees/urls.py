from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, EmployeeViewSet, PartnerViewSet

app_name = 'employees'

employee_router = DefaultRouter()
employee_router.register(r'', EmployeeViewSet, basename='employee')

customer_router = DefaultRouter()
customer_router.register(r'', CustomerViewSet, basename='customer')

partner_router = DefaultRouter()
partner_router.register(r'', PartnerViewSet, basename='partner')

urlpatterns = [
    path('partners/', include(partner_router.urls)),
    path('customers/', include(customer_router.urls)),
    path('', include(employee_router.urls)),
]
