from rest_framework import permissions
from django.core.exceptions import PermissionDenied


class IsSelfOrHasPermission(permissions.BasePermission):
    """
    Permission class to ensure user has the permission or it is the user itself accessing this
    """
    message = "You don't have permission to access this data."
    
    def has_object_permission(self, request, view, obj):
        """Check if user can access the specific object"""
        if not request.user.is_authenticated:
            return False
        
        # Superusers can access everything
        if request.user.is_superuser:
            return True
        
        if obj.id == request.user.id:
            return True
        
        # Get permission requirements from view
        permission_module = getattr(view, 'permission_module', None)
        permission_action = getattr(view, 'permission_action', None)
        
        if not permission_module or not permission_action:
            return True
        # Map HTTP methods to actions if not explicitly set
        if permission_action == 'auto':
            action_map = {
                'GET': 'view',
                'POST': 'add',
                'PUT': 'change',
                'PATCH': 'change',
                'DELETE': 'delete',
            }
            permission_action = action_map.get(request.method, 'view')
        
                
        # Check if user has the permission through their roles
        return _user_has_permission(request.user, permission_module, permission_action)


class HasModulePermission(permissions.BasePermission):
    """
    Permission class for checking module-specific permissions.
    Usage: Add permission_module and permission_action attributes to your view.
    """
    
    def has_permission(self, request, view):
        """Check if user has required module permission"""
        if not request.user.is_authenticated:
            return False
        
        # Superusers have all permissions
        if request.user.is_superuser:
            return True
        
        # Get permission requirements from view
        permission_module = getattr(view, 'permission_module', None)
        permission_action = getattr(view, 'permission_action', None)
        
        if not permission_module:
            return True
            # If no specific permission is required, just check tenant access
            # return hasattr(request.user, 'tenant_id') and request.user.tenant_id
        
        # Map HTTP methods to actions if not explicitly set
        if not permission_action or permission_action == 'auto':
            action_map = {
                'GET': 'view',
                'POST': 'add',
                'PUT': 'change',
                'PATCH': 'change',
                'DELETE': 'delete',
            }
            permission_action = action_map.get(request.method, 'view')
        
                
        # Check if user has the permission through their roles
        return _user_has_permission(request.user, permission_module, permission_action)


class IsSystemAdmin(permissions.BasePermission):
    """
    Permission for system administrators only.
    """
    message = "Only system administrators can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class CanAccessSettings(permissions.BasePermission):
    """
    Permission for accessing tenant settings.
    """
    message = "You don't have permission to modify settings."
    
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True
        
        # Only allow GET requests for non-admin users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For modify operations, check admin role
        return user.role_name == 'admin'
        

class PermissionMixin:
    """
    Mixin to add tenant-aware permission checking to views.
    """
    permission_classes = []
    permission_module = None
    permission_action = 'auto'
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if hasattr(self, 'action') and self.action:
            action_obj = getattr(self.__class__, self.action, None)
            if action_obj is not None:
                # check if the action has its own permission_classes defined
                if hasattr(action_obj, 'kwargs') and 'permission_classes' in action_obj.kwargs:
                    return [permission() for permission in action_obj.kwargs['permission_classes']]
                
                if hasattr(action_obj, 'kwargs') and 'permission_module' in action_obj.kwargs:
                    self.permission_module = action_obj.kwargs['permission_module']
        permission_classes = self.permission_classes.copy()
        
        # Add module permission if specified
        if self.permission_module:
            permission_classes.append(HasModulePermission)
        
        return [permission() for permission in permission_classes]
    
    def perform_destroy(self, instance):
        if hasattr(instance, 'deleted_at'):
            if hasattr(instance, 'soft_delete'):
                instance.soft_delete()
            else:
                from django.utils.timezone import now
                instance.deleted_at = now()
            return
        instance.delete()


def permission_required(permission_module, permission_action):
    """
    Decorator to check specific permission.
    """
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                raise PermissionDenied("Authentication required.")
            
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            
            
            permission_codename = f"{permission_module}.{permission_action}"
            if not _user_has_permission(request.user, permission_module, permission_action):
                raise PermissionDenied(f"Permission '{permission_codename}' required.")
                
            # Check permission through user roles
            
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def _user_has_permission(user, permission_module, permission_action):
    """Check if user has specific permission through their roles"""
    from accounts.models import UserPermission, RolePermission  # Import here to avoid circular imports
    permission_actions = [permission_action, 'all']
    override = UserPermission.objects.filter(
        user=user,
        permission__module=permission_module,
        permission__action__in=permission_actions
    )
    if override.exists():
        if override.count() > 1:
            override = override.filter(permission_action='all')
        return override.first().allow
    try:
        # Get user's roles and check permissions
        role_name = user.role_name
        return RolePermission.objects.filter(
            role_name=role_name,
            permission__module=permission_module,
            permission__action__in=permission_actions
        ).exists()
    except:
        return False
        