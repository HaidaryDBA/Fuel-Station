from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import ROLE_CHOICES, ActivityLog, User, RolePermission
# serializers.py


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password.')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for User profile data"""
    permissions = serializers.SerializerMethodField()
    
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'username', 'email', 'phone',
            'role_name', 'permissions',
            'language_preference', 
            'theme', 'is_active', 'last_login'
        ]
        read_only_fields = ['id', 'last_login']
    

    def get_permissions(self, obj):
        """Get all permissions for this user through roles and direct permissions"""
        permissions = set()
        
        # Get permissions from role
        if obj.role_name:
            role_name = obj.role_name
            role_permissions = RolePermission.objects.filter(role_name=role_name)
            
            for rp in role_permissions:
                permissions.add(rp.permission.module)
        
        # Get direct user permissions
        user_permissions = obj.users_permissions.filter(allow=True).select_related('permission')
        for up in user_permissions:
            permissions.add(up.permission.module)
        
        # Remove denied permissions
        denied_permissions = obj.users_permissions.filter(allow=False).select_related('permission')
        for dp in denied_permissions:
            permissions.discard(dp.permission.module)
        
        return list(permissions)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'firstName': data['first_name'],
            'lastName': data['last_name'],
            'username': data['username'],
            'email': data['email'],
            'phone': data['phone'],
            'role': data['role_name'] if data['role_name'] else None,
            'permissions': data['permissions'],
            'preferences': {
                'language': data['language_preference'],
                'theme': data['theme']
            }
        }
    
    def update(self, instance, validated_data):
        # Handle role update
        if 'role_name' in validated_data:
            role_name = validated_data.pop('role_name')
            if role_name:
                valid_roles = {role for role, _ in ROLE_CHOICES}
                if role_name not in valid_roles:
                    raise serializers.ValidationError({'role_name': 'Invalid role Name'})
                instance.role_name = role_name
        
        
        return super().update(instance, validated_data)


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for User profile data"""
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name',  'last_name', 'username', 'email', 'phone',
            'role_name',
        ]
    

class CreateUserSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (admin only)"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    send_verification_email = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'username', 'email', 'phone', 'password',
            'role_name', 'send_verification_email'
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_role_name(self, role_name):
        if role_name == 'admin':
            raise serializers.ValidationError("Invalid Role Name")
        valid_roles = {role for role, _ in ROLE_CHOICES}
        if role_name not in valid_roles:
            raise serializers.ValidationError("Invalid Role Name")
        return role_name

    def create(self, validated_data):
        import secrets
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.template.loader import render_to_string
        from datetime import datetime
        from django.utils import timezone

        role_name = validated_data.pop('role_name')
        password = validated_data.pop('password')
        send_email = validated_data.pop('send_verification_email', False)

        # Create user
        user = User.objects.create_user(
            password=password,
            role_name=role_name,
            **validated_data
        )

        # Send verification email if requested
        if send_email and user.email:
            token = secrets.token_urlsafe(32)
            user.email_verification_token = token
            user.email_verification_sent_at = timezone.now()
            user.email_verified = False
            user.save(update_fields=['email_verification_token', 'email_verification_sent_at', 'email_verified'])

            # Send verification email
            verification_url = f"{settings.FRONTEND_URL}/mis/auth/verify-email/{token}"
            context = {
                'user': user,
                'verification_url': verification_url,
                'current_year': datetime.now().year
            }

            try:
                html_content = render_to_string('emails/email_verification.html', context)
                text_content = f'Welcome! Click the link below to verify your email:\n\n{verification_url}\n\nThis link will expire in 24 hours.'

                email_msg = EmailMultiAlternatives(
                    subject='Welcome to School MIS - Verify Your Email',
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email]
                )
                email_msg.attach_alternative(html_content, "text/html")
                email_msg.send(fail_silently=False)
            except Exception as e:
                # Log the error but don't fail user creation
                print(f"Failed to send verification email: {e}")
        else:
            # Mark email as verified if not sending verification
            user.email_verified = True
            user.save(update_fields=['email_verified'])

        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_username', 'action',
            'table_name', 'record_id', 'old_values', 'new_values',
            'ip_address', 'user_agent', 'session_id', 'timestamp', 'created_at'
        ]
        read_only_fields = ['created_at', 'user_name', 'user_username']


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating activity logs"""

    class Meta:
        model = ActivityLog
        fields = [
            'action', 'table_name', 'record_id', 'old_values',
            'new_values', 'ip_address', 'user_agent', 'session_id'
        ]


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request - sends verification code"""
    email_or_username = serializers.CharField(required=True)

    def validate_email_or_username(self, value):
        """Check if user exists"""
        user = User.objects.filter(username=value).first() or User.objects.filter(email=value).first()
        if not user:
            raise serializers.ValidationError("No user found with this email or username")
        if not user.is_active:
            raise serializers.ValidationError("This account is deactivated")
        return value


class VerifyResetCodeSerializer(serializers.Serializer):
    """Serializer for verifying the reset code"""
    email_or_username = serializers.CharField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for password reset with verification code"""
    email_or_username = serializers.CharField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Check if user exists and email not already verified"""
        user = User.objects.filter(email=value).first()
        if not user:
            raise serializers.ValidationError("No user found with this email")
        if user.email_verified:
            raise serializers.ValidationError("Email is already verified")
        return value
