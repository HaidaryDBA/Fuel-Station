from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser


from .models import (
    Settings
)
from .serializers import (
    EmailSettingsSerializer, ShopSettingsSerializer
)
from .permissions import (
    
    CanAccessSettings, PermissionMixin
)


class SettingsViewSet(PermissionMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated, CanAccessSettings]
    
    @action(detail=False, methods=['get', 'put'], url_path='shop')
    def shop_settings(self, request):
        """
        GET or PUT /api/settings/shop/
        """
        keys = ['shop_name', 'phone_number', 'contact_email', 'address']

        if request.method == 'GET':
            settings = Settings.objects.filter(setting_key__in=keys)
            data = {key: "" for key in keys}
            for s in settings:
                data[s.setting_key] = s.get_typed_value()
            return Response(data)
        
        
        serializer = ShopSettingsSerializer(
            data=request.data,
            
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get', 'put'], url_path='email')
    def email_settings(self, request):
        """
        GET or PUT /api/settings/email/
        """
        keys = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email']

        if request.method == 'GET':
            settings = Settings.objects.filter(setting_key__in=keys)
            data = {key: "" for key in keys}
            for s in settings:
                data[s.setting_key] = s.get_typed_value()
            # Never return smtp_password if you want security
            data['smtp_password'] = None
            return Response(data)

        serializer = EmailSettingsSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get', 'put'], url_path='logo', parser_classes=[MultiPartParser])
    def logo_settings(self, request):
        """
        GET /api/settings/logo/     → Get current logo URL
        PUT /api/settings/logo/     → Upload or update logo image
        """
        key = 'shop_logo'
        shop_key = "shop_name"
        if request.method == 'GET':
            try:
                setting = Settings.objects.get(setting_key=key, setting_type='image')
                shop_name = Settings.objects.get(setting_key=shop_key)
                logo_url = request.build_absolute_uri(setting.get_typed_value())
                return Response({'logo': logo_url, 'shop_name': shop_name.get_typed_value()}, status=200)
            except Settings.DoesNotExist:
                return Response({'logo': None, 'shop_name': ''}, status=200)

        # PUT logic: handle file upload
        file = request.FILES.get('logo')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        setting, created = Settings.objects.get_or_create(
            setting_key=key,
            defaults={
                'setting_type': 'image',
                'category': 'branding',
                'description': 'Shop logo',
            }
        )

        setting.setting_image = file
        setting.save()
        logo_url = request.build_absolute_uri(setting.get_typed_value())

        return Response({'logo': logo_url}, status=200)

      
from rest_framework.views import APIView
class InitializeView(PermissionMixin, APIView):
    def get(self, request):
        return Response(_get_initial_data(request))
    
    
def _get_initial_data(request):
    
    return {
        "settings": _get_settings(request)
    }

def _get_settings(request):
    
    keys = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email']
    settings = Settings.objects.filter(setting_key__in=keys)
    email_settings = {key: "" for key in keys}
    for s in settings:
        email_settings[s.setting_key] = s.get_typed_value()
    # Never return smtp_password if you want security
    email_settings['smtp_password'] = None
    key = 'shop_logo'
    try:
        setting = Settings.objects.get(setting_key=key, setting_type='image')
        logo_url = request.build_absolute_uri(setting.get_typed_value())
        logo_settings = {'logo': logo_url}
    except Settings.DoesNotExist:
        logo_settings = {'logo': None}

    keys = ['shop_name', 'phone_number', 'contact_email', 'address']

    settings = Settings.objects.filter(setting_key__in=keys)
    shop_settings = {key: "" for key in keys}
    for s in settings:
        shop_settings[s.setting_key] = s.get_typed_value()

    return {
        "shop_settings": shop_settings,
        "logo_settings": logo_settings,
        "email_settings": email_settings
    }