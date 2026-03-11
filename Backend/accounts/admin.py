from django.contrib import admin
from .models import ActivityLog, RolePermission, User
# Register your models here.

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
  fields = ('role_name', 'permission')
  list_display = ('role_name', 'permission')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
  fields = ("first_name", "last_name", "username", "email", "role_name")
  list_display = ("first_name", "last_name", "username", "email", "role_name")


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'action', 'table_name', 'record_id', 
        'ip_address', 'timestamp'
    ]
    list_filter = ['action', 'table_name', 'timestamp']
    search_fields = ['user__username', 'table_name', 'ip_address']
    readonly_fields = [
        'user', 'action', 'table_name', 'record_id', 'old_values', 
        'new_values', 'ip_address', 'user_agent', 'session_id', 
        'timestamp', 'created_at', 
    ]
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
