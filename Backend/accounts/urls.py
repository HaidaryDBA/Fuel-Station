from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'auth', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path("token/refresh/", views.CookieTokenRefreshView.as_view(), name="token_refresh"),
]