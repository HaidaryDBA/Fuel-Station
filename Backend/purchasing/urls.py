from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OrderPurchaseViewSet, PurchaseViewSet, SupplierViewSet

app_name = 'purchasing'

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'purchases', PurchaseViewSet, basename='purchase')
router.register(r'order-purchases', OrderPurchaseViewSet, basename='order-purchase')

urlpatterns = [
    path('', include(router.urls)),
]

