from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LendingViewSet, SaleViewSet

app_name = 'sales'

router = DefaultRouter()
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'lendings', LendingViewSet, basename='lending')

urlpatterns = [
    path('', include(router.urls)),
]

