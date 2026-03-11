from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from accounts.models import ActivityLog


# Thread-local storage for tenant context


class ActivityLogMiddleware(MiddlewareMixin):
    """
    Middleware to automatically log user activities.
    """
    
    LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    IGNORED_PATHS = [
        '/api/auth/login/',
        '/api/auth/logout/',
        '/api/auth/refresh/',
        '/api/activity-logs/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """Store request start time and data for logging."""
        request._activity_log_start_time = timezone.now()
        return None
    
    def process_response(self, request, response):
        """Log activity after successful response."""
        if (request.method in self.LOGGED_METHODS and 
            response.status_code < 400 and
            self._should_log_request(request)):
            
            self._log_activity(request, response)
        
        return response
    
    def _should_log_request(self, request):
        """Check if request should be logged."""
        path = request.path
        
        # Skip ignored paths
        for ignored_path in self.IGNORED_PATHS:
            if path.startswith(ignored_path):
                return False
        
        # Only log authenticated requests with tenant
        return (request.user.is_authenticated and 
                hasattr(request, 'tenant') and 
                request.tenant)
    
    def _log_activity(self, request, response):
        """Create activity log entry."""
        try:
            # Extract action and object info from URL
            action = self._get_action_from_method(request.method)
            object_type, object_id = self._extract_object_info(request.path)
            
            # Get client IP
            ip_address = self._get_client_ip(request)
            
            ActivityLog.objects.create(
                tenant=request.tenant,
                user=request.user,
                action=action,
                object_type=object_type,
                object_id=object_id,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            )
        except Exception:
            # Don't let logging errors break the request
            pass
    
    def _get_action_from_method(self, method):
        """Map HTTP method to action."""
        action_map = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        return action_map.get(method, 'unknown')
    
    def _extract_object_info(self, path):
        """Extract object type and ID from URL path."""
        parts = [p for p in path.split('/') if p]
        
        if len(parts) >= 2 and parts[0] == 'api':
            object_type = parts[1].replace('-', '_').rstrip('s')  # Convert to singular
            # Try to get object ID if present
            object_id = None
            if len(parts) >= 4:
                try:
                    object_id = int(parts[3])
                except ValueError:
                    pass
            
            return object_type, object_id
        
        return 'unknown', None
    
    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
