from django.contrib import admin
from .models import (
    Settings, Permission
)

class SettingsInline(admin.TabularInline):
    model = Settings
    extra = 0
    fields = ['setting_key', 'setting_value', 'setting_type', 'description']


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ['setting_key', 'setting_type', 'created_at']
    list_filter = ['setting_type', 'created_at']
    search_fields = ['setting_key', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['action', 'module', 'description', 'created_at']
    list_filter = ['module', 'created_at']
    search_fields = ['action', 'description']
    readonly_fields = ['created_at']



# Customize admin site
admin.site.site_header = 'Business Management System Admin'
admin.site.site_title = 'BMS Admin'
admin.site.index_title = 'Welcome to Business Management System Administration'