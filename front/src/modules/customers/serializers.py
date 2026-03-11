from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'photo',
            'photo_url',
            'phone',
            'email',
            'address',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'photo_url', 'created_at', 'updated_at']

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

