from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    FuelMotorViewSet,
    FuelViewSet,
    InventoryTransactionViewSet,
    PriceHistoryViewSet,
    TankStorageViewSet,
)

app_name = 'inventory'

router = DefaultRouter()
router.register(r'fuel', FuelViewSet, basename='fuel')
router.register(r'tank-storage', TankStorageViewSet, basename='tank-storage')
router.register(r'fuel-motor', FuelMotorViewSet, basename='fuel-motor')
router.register(r'price-history', PriceHistoryViewSet, basename='price-history')
router.register(r'transaction', InventoryTransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
