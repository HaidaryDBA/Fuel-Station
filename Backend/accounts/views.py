from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import update_session_auth_hash
from django.core.files.storage import default_storage
from core.models import Permission
from django.db.models import Count
from core.permissions import (
    IsSelfOrHasPermission,
    PermissionMixin
)
from .models import (
    ActivityLog, User, UserPermission
)
from .serializers import (
    ActivityLogSerializer, UserListSerializer, UserProfileSerializer,
    ChangePasswordSerializer, LoginSerializer,
    CreateUserSerializer, ForgotPasswordSerializer,
    VerifyResetCodeSerializer, ResetPasswordSerializer, VerifyEmailSerializer,
    ResendVerificationSerializer
)

from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, DateFilter


def _should_use_secure_cookie(request):
    if request.is_secure():
        return True
    return bool(getattr(settings, 'AUTH_COOKIE_SECURE', False))


def _refresh_cookie_kwargs(request):
    return {
        'key': getattr(settings, 'AUTH_COOKIE_NAME', 'refresh_token'),
        'httponly': getattr(settings, 'AUTH_COOKIE_HTTPONLY', True),
        'secure': _should_use_secure_cookie(request),
        'samesite': getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax'),
        'path': getattr(settings, 'AUTH_COOKIE_PATH', '/'),
        'max_age': getattr(settings, 'AUTH_COOKIE_MAX_AGE', 7 * 24 * 60 * 60),
    }


def set_refresh_cookie(response, request, refresh_token):
    cookie_kwargs = _refresh_cookie_kwargs(request)
    response.set_cookie(value=refresh_token, **cookie_kwargs)


def clear_refresh_cookie(response, request):
    cookie_kwargs = _refresh_cookie_kwargs(request)
    response.delete_cookie(
        key=cookie_kwargs['key'],
        path=cookie_kwargs['path'],
        samesite=cookie_kwargs['samesite'],
    )

# views.py or viewsets.py


class UserViewSet(PermissionMixin, viewsets.ModelViewSet):
    """ViewSet for User management"""
    serializer_class = UserProfileSerializer
    permission_module = 'users'
    parser_classes = [MultiPartParser, FormParser, JSONParser] 
    
    def get_queryset(self):

        user = self.request.user
        if user.role_name and user.role_name == 'admin':
            return User.objects.all()
        else:
            # Regular users can only see themselves
            return User.objects.filter(id=user.id).select_related('location', 'preferred_currency')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        elif self.action == "list":
            return UserListSerializer
        return UserProfileSerializer
        
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def activate(self, request, pk=None):
        """Activate user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': 'User activated successfully'})

    @action(detail=False, methods=['get', 'patch'], permission_module=None)
    def me(self, request):
        if self.action == "get":
            """Get current user profile"""
            
            serializer = self.get_serializer(request.user, context={'request': request})
            return Response(serializer.data)

        """Update current user profile"""
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def permissions(self, request, pk=None):
        user: User = self.get_object()
        selected_modules = set(request.data.get("permissions", []))

        if not selected_modules:
            return Response({"details": "Permissions Not Provided!"}, status=status.HTTP_400_BAD_REQUEST)

        # Clear all previous permissions (start clean)
        UserPermission.objects.filter(user=user).delete()

        # Apply permission per module (override role)
        for module, _ in Permission.MODULES:
            permissions = Permission.objects.filter(module=module)
            allow = module in selected_modules

            for p in permissions:
                UserPermission.objects.create(user=user, permission=p, allow=allow)

        return Response({"message": "Permissions set successfully"}, status=200)


class AuthViewSet(viewsets.ViewSet):
    """Authentication viewset"""
    from django.core.handlers.wsgi import WSGIRequest
    @action(detail=False, methods=['post'])
    def login(self, request: WSGIRequest):
        """User login with attempt tracking and lockout"""
        from datetime import timedelta

        username = request.data.get('username', '')

        # Check if account is locked
        user_check = User.objects.filter(username=username).first()
        if user_check:
            if user_check.account_locked_until and timezone.now() < user_check.account_locked_until:
                minutes_remaining = int((user_check.account_locked_until - timezone.now()).total_seconds() / 60)
                return Response({
                    "detail": f"Account is locked. Try again in {minutes_remaining} minutes.",
                    "locked_until": user_check.account_locked_until.isoformat(),
                    "attempts_remaining": 0
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            # Unlock if lock period expired
            if user_check.account_locked_until and timezone.now() >= user_check.account_locked_until:
                user_check.account_locked_until = None
                user_check.failed_login_attempts = 0
                user_check.save(update_fields=['account_locked_until', 'failed_login_attempts'])

        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            # Track failed login attempt
            if user_check:
                user_check.failed_login_attempts += 1

                # Lock account after 5 failed attempts
                if user_check.failed_login_attempts >= 5:
                    user_check.account_locked_until = timezone.now() + timedelta(minutes=30)
                    user_check.save(update_fields=['failed_login_attempts', 'account_locked_until'])
                    return Response({
                        "detail": "Account locked due to too many failed login attempts. Try again in 30 minutes.",
                        "locked_until": user_check.account_locked_until.isoformat(),
                        "attempts_remaining": 0
                    }, status=status.HTTP_429_TOO_MANY_REQUESTS)
                else:
                    user_check.save(update_fields=['failed_login_attempts'])
                    attempts_remaining = 5 - user_check.failed_login_attempts
                    return Response({
                        "detail": "Invalid credentials.",
                        "attempts_remaining": attempts_remaining
                    }, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]

        # ✅ Reset failed login attempts on successful login
        user.failed_login_attempts = 0
        user.account_locked_until = None

        # ✅ Set JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Get client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        user.last_login = timezone.now()
        user.last_login_ip = ip_address
        user.last_login_user_agent = request.META.get('HTTP_USER_AGENT', '')
        user.save(update_fields=[
            "last_login", "failed_login_attempts",
            "account_locked_until", "last_login_ip", "last_login_user_agent"
        ])

        # ✅ Return response with user data and access token
        res = Response({
            "access": access_token,
            "user": UserProfileSerializer(user, context={"request": request}).data,
            "message": "Login successful"
        })

        # ✅ Set httpOnly cookie for refresh token
        set_refresh_cookie(res, request, refresh_token)

        return res
        
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """User logout"""
        try:
            refresh_token = request.COOKIES.get(getattr(settings, 'AUTH_COOKIE_NAME', 'refresh_token'))
            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response({"detail": "Logged out"})
            clear_refresh_cookie(response, request)
            return response
        except Exception:
            return Response({"detail": "Invalid token"}, status=400)
        # logout(request)
        # return Response({'message': 'Logout successful'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user info"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Keep user logged in after password change
            update_session_auth_hash(request, user)

            return Response({
                'message': 'Password changed successfully'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='forgot-password')
    def forgot_password(self, request):
        """Send password reset verification code to email"""
        import random
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.template.loader import render_to_string
        from datetime import datetime

        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email_or_username']
        user = User.objects.filter(username=email_or_username).first() or \
               User.objects.filter(email=email_or_username).first()

        if user:
            # Check if user has an email
            if not user.email:
                return Response({
                    'success': False,
                    'message': 'This account does not have an email address associated with it. Please contact support for assistance.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate 6-digit verification code
            verification_code = str(random.randint(100000, 999999))
            user.password_reset_code = verification_code
            user.password_reset_sent_at = timezone.now()
            user.password_reset_attempts = 0  # Reset attempts counter
            user.save(update_fields=['password_reset_code', 'password_reset_sent_at', 'password_reset_attempts'])

            # Mask email for privacy (e.g., s*****@gmail.com)
            email_parts = user.email.split('@')
            masked_local = email_parts[0][0] + '*' * (len(email_parts[0]) - 1) if len(email_parts[0]) > 1 else email_parts[0]
            masked_email = f"{masked_local}@{email_parts[1]}"

            # Send verification code email
            context = {
                'user': user,
                'verification_code': verification_code,
                'current_year': datetime.now().year
            }

            try:
                html_content = render_to_string('emails/password_reset_code.html', context)
                text_content = f'Your password reset verification code is: {verification_code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.'

                email = EmailMultiAlternatives(
                    subject='Password Reset Verification Code - School MIS',
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send(fail_silently=False)

                return Response({
                    'success': True,
                    'message': f'A verification code has been sent to {masked_email}',
                    'masked_email': masked_email
                })
            except Exception as e:
                print(f"Failed to send email: {e}")
                return Response(
                    {'success': False, 'message': 'Failed to send verification code. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # User not found - return generic message to prevent user enumeration
            return Response({
                'success': True,
                'message': 'If an account exists, a verification code has been sent to the associated email.'
            })

    @action(detail=False, methods=['post'], url_path='verify-reset-code')
    def verify_reset_code(self, request):
        """Verify the password reset code"""
        from datetime import timedelta

        serializer = VerifyResetCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email_or_username']
        code = serializer.validated_data['code']

        user = User.objects.filter(username=email_or_username).first() or \
               User.objects.filter(email=email_or_username).first()

        if not user or not user.password_reset_code:
            return Response(
                {'success': False, 'message': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if code is expired (15 minutes)
        if user.password_reset_sent_at:
            expiry_time = user.password_reset_sent_at + timedelta(minutes=15)
            if timezone.now() > expiry_time:
                user.password_reset_code = None
                user.password_reset_sent_at = None
                user.password_reset_attempts = 0
                user.save(update_fields=['password_reset_code', 'password_reset_sent_at', 'password_reset_attempts'])
                return Response(
                    {'success': False, 'message': 'Verification code has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Check attempts (max 5 attempts)
        if user.password_reset_attempts >= 5:
            user.password_reset_code = None
            user.password_reset_sent_at = None
            user.password_reset_attempts = 0
            user.save(update_fields=['password_reset_code', 'password_reset_sent_at', 'password_reset_attempts'])
            return Response(
                {'success': False, 'message': 'Too many failed attempts. Please request a new code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify code
        if user.password_reset_code != code:
            user.password_reset_attempts += 1
            user.save(update_fields=['password_reset_attempts'])
            attempts_left = 5 - user.password_reset_attempts
            return Response(
                {'success': False, 'message': f'Invalid code. {attempts_left} attempts remaining.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Code is valid
        return Response({
            'success': True,
            'message': 'Verification code is valid'
        })

    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request):
        """Reset password with verification code"""
        from datetime import timedelta

        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email_or_username = serializer.validated_data['email_or_username']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(username=email_or_username).first() or \
               User.objects.filter(email=email_or_username).first()

        if not user or not user.password_reset_code:
            return Response(
                {'success': False, 'message': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if code is expired (15 minutes)
        if user.password_reset_sent_at:
            expiry_time = user.password_reset_sent_at + timedelta(minutes=15)
            if timezone.now() > expiry_time:
                user.password_reset_code = None
                user.password_reset_sent_at = None
                user.password_reset_attempts = 0
                user.save(update_fields=['password_reset_code', 'password_reset_sent_at', 'password_reset_attempts'])
                return Response(
                    {'success': False, 'message': 'Verification code has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Verify code
        if user.password_reset_code != code:
            user.password_reset_attempts += 1
            user.save(update_fields=['password_reset_attempts'])
            return Response(
                {'success': False, 'message': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reset password
        user.set_password(new_password)
        user.password_reset_code = None
        user.password_reset_sent_at = None
        user.password_reset_attempts = 0
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.save()

        return Response({
            'success': True,
            'message': 'Password reset successfully'
        })

    @action(detail=False, methods=['post'], url_path='verify-email')
    def verify_email(self, request):
        """Verify user email with token"""
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']
        user = User.objects.filter(email_verification_token=token).first()

        if not user:
            return Response(
                {'error': 'Invalid or expired verification token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if token is expired (24 hours)
        from datetime import timedelta
        if user.email_verification_sent_at:
            expiry_time = user.email_verification_sent_at + timedelta(hours=24)
            if timezone.now() > expiry_time:
                return Response(
                    {'error': 'Verification token has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Verify email
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_sent_at = None
        user.save()

        return Response({
            'message': 'Email verified successfully'
        })

    @action(detail=False, methods=['post'], url_path='resend-verification')
    def resend_verification(self, request):
        """Resend email verification"""
        import secrets
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.template.loader import render_to_string
        from datetime import datetime

        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()

        if user and not user.email_verified:
            # Generate verification token
            token = secrets.token_urlsafe(32)
            user.email_verification_token = token
            user.email_verification_sent_at = timezone.now()
            user.save(update_fields=['email_verification_token', 'email_verification_sent_at'])

            # Send email with HTML template
            verification_url = f"{settings.FRONTEND_URL}/mis/verify-email/{token}"
            context = {
                'user': user,
                'verification_url': verification_url,
                'current_year': datetime.now().year
            }

            try:
                html_content = render_to_string('emails/email_verification.html', context)
                text_content = f'Click the link below to verify your email:\n\n{verification_url}\n\nThis link will expire in 24 hours.'

                email_msg = EmailMultiAlternatives(
                    subject='Email Verification - School MIS',
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                email_msg.attach_alternative(html_content, "text/html")
                email_msg.send(fail_silently=False)
            except Exception as e:
                return Response(
                    {'error': 'Failed to send email. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            'message': 'Verification email sent successfully'
        })

    @action(detail=False, methods=['post'], url_path='refresh-session', permission_classes=[IsAuthenticated])
    def refresh_session(self, request):
        """Refresh user session (keep-alive)"""
        user = request.user
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            'message': 'Session refreshed successfully'
        })

    @action(detail=False, methods=['get'], url_path='login-attempts/(?P<username>[^/.]+)')
    def login_attempts(self, request, username=None):
        """Get login attempt information for a user"""
        user = User.objects.filter(username=username).first()

        if not user:
            return Response({
                'failed_attempts': 0,
                'is_locked': False,
                'attempts_remaining': 5
            })

        is_locked = False
        locked_until = None

        if user.account_locked_until:
            if timezone.now() < user.account_locked_until:
                is_locked = True
                locked_until = user.account_locked_until.isoformat()
            else:
                # Unlock if period expired
                user.account_locked_until = None
                user.failed_login_attempts = 0
                user.save(update_fields=['account_locked_until', 'failed_login_attempts'])

        return Response({
            'failed_attempts': user.failed_login_attempts,
            'is_locked': is_locked,
            'locked_until': locked_until,
            'attempts_remaining': max(0, 5 - user.failed_login_attempts)
        })


class ActivityLogFilter(FilterSet):
    action = CharFilter(exact=True)
    table_name = CharFilter(lookup_expr='icontains')
    user = CharFilter(field_name='user__username', lookup_expr='icontains')
    date_from = DateFilter(field_name='timestamp', lookup_expr='gte')
    date_to = DateFilter(field_name='timestamp', lookup_expr='lte')
    ip_address = CharFilter(exact=True)

    class Meta:
        model = ActivityLog
        fields = ['action', 'table_name', 'user', 'ip_address']


class ActivityLogViewSet(PermissionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ActivityLogFilter
    ordering_fields = ['timestamp', 'action', 'user']
    ordering = ['-timestamp']

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get activity statistics for dashboard"""
        from datetime import timedelta
        
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        queryset = self.get_queryset()
        
        stats = {
            'today': queryset.filter(timestamp__date=today).count(),
            'this_week': queryset.filter(timestamp__date__gte=week_ago).count(),
            'this_month': queryset.filter(timestamp__date__gte=month_ago).count(),
            'by_action': list(queryset.values('action').annotate(count=Count('id')).order_by('-count')[:5]),
            'by_user': list(queryset.values('user__username', 'user__first_name', 'user__last_name')
                          .annotate(count=Count('id')).order_by('-count')[:5]),
            'recent_activities': ActivityLogSerializer(
                queryset[:10], many=True, context={'request': request}
            ).data
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export activity logs (simplified - returns data for now)"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # In a real implementation, you'd generate CSV/Excel file
        return Response({
            'count': queryset.count(),
            'data': serializer.data[:1000]  # Limit for performance
        })
        
  
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.response import Response
from rest_framework import status

class CookieTokenRefreshView(TokenRefreshView):
    """
    Refresh access token using refresh token from httpOnly cookie.
    Also, sets the new rotated refresh token in the cookie.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(getattr(settings, 'AUTH_COOKIE_NAME', 'refresh_token'))
        if not refresh_token:
            return Response({"detail": "Refresh token not found in cookie."}, status=status.HTTP_401_UNAUTHORIZED)

        # We are using the default serializer, which expects the refresh token in the body.
        # So we pass it in the data dictionary.
        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            # The token is invalid or expired
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
        # The serializer.validated_data contains the new access and refresh tokens
        access_token = serializer.validated_data["access"]
        new_refresh_token = serializer.validated_data["refresh"]

        res = Response({"access": access_token, "message": "Token refreshed successfully"})

        # ✅ Set the new refresh token in the httpOnly cookie
        set_refresh_cookie(res, request, new_refresh_token)
        
        return res
