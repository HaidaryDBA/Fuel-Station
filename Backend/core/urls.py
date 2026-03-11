from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'core'

router = DefaultRouter()
router.register(r'settings', views.SettingsViewSet, basename='tenant-settings')

urlpatterns = [
    path('', include(router.urls)),
    path('initialize', views.InitializeView.as_view(), name="initialize")
]