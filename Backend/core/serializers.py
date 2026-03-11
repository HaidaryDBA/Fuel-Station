from rest_framework import serializers

from .models import (
    Settings
)


class ShopSettingsSerializer(serializers.Serializer):
    shop_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        tenant = self.context['tenant']
        for key, value in validated_data.items():
            if value:
                Settings.set_setting(
                    tenant=tenant,
                    key=key,
                    value=value,
                    setting_type='string',
                    category='general',
                    description=f"{key.replace('_', ' ').capitalize()} of the shop"
                )
        return validated_data

    def create(self, validated_data):
        return self.update(None, validated_data)

        
class EmailSettingsSerializer(serializers.Serializer):
    smtp_host = serializers.CharField(required=False, allow_blank=True)
    smtp_port = serializers.CharField(required=False, allow_blank=True)  # Accept as string first
    smtp_username = serializers.CharField(required=False, allow_blank=True)
    smtp_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    from_email = serializers.EmailField(required=False, allow_blank=True)

    def validate_smtp_port(self, value):
        # Skip empty values
        if value in [None, ""]:
            return None
        try:
            return int(value)
        except ValueError:
            raise serializers.ValidationError("smtp_port must be an integer.")

    def update(self, instance, validated_data):
        tenant = self.context['tenant']
        for key, value in validated_data.items():
            if value not in [None, ""]:
                setting_type = 'integer' if key == 'smtp_port' else 'string'
                Settings.set_setting(
                    tenant=tenant,
                    key=key,
                    value=value,
                    setting_type=setting_type,
                    category='notifications',
                    description=f"{key.replace('_', ' ').capitalize()} for email configuration"
                )
        return validated_data

    def create(self, validated_data):
        return self.update(None, validated_data)

