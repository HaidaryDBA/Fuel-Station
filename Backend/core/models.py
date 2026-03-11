from django.db import models

from core.image_path import settings_image_upload_path
from .base_models import BaseModel


class Settings(BaseModel):
    SETTING_TYPES = [
        ('string', 'String'),
        ('integer', 'Integer'),
        ('float', 'Float'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
        ('image', 'Image')
    ]
    
    CATEGORIES = [
        ('general', 'General'),
        ('security', 'Security'),
        ('notifications', 'Notifications'),
        ('integration', 'Integration'),
        ('billing', 'Billing'),
    ]

    setting_key = models.CharField(max_length=100)
    setting_value = models.TextField(blank=True, null=True)
    setting_image = models.ImageField(
        upload_to=settings_image_upload_path,
        blank=True,
        null=True
    )
    
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='string')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='general')

    class Meta:
        db_table = 'settings'
        unique_together = ['setting_key']
        indexes = [
            models.Index(fields=['setting_key']),
        ]

    def __str__(self):
        return f"{self.setting_key}"

    def get_typed_value(self):
        """Return the setting value in its proper type"""
        if self.setting_type == 'integer':
            return int(self.setting_value)
        elif self.setting_type == 'float':
            return float(self.setting_value)
        elif self.setting_type == 'boolean':
            return self.setting_value.lower() in ['true', '1', 'yes', 'on']
        elif self.setting_type == 'json':
            import json
            return json.loads(self.setting_value)
        elif self.setting_type == 'image':
            return self.setting_image.url if self.setting_image else None
        return self.setting_value

    @classmethod
    def set_setting(cls, key, value, setting_type='string', category='general', description='', image=None):
        """Set or update a setting"""
        setting, created = cls.objects.get_or_create(
            setting_key=key,
            defaults={
                'setting_value': value,
                'setting_type': setting_type,
                'category': category,
                'description': description,
                'setting_image': image,
            }
        )
        if not created:
            setting.setting_value = value
            setting.setting_type = setting_type
            setting.category = category
            setting.description = description
            if image:
                setting.setting_image = image
            setting.save()
        return setting


class Permission(models.Model):
    MODULES = [
        ('users', 'Users'),
        ('purchases', 'Purchases'),
        ('reports', 'Reports'),
        ('settings', 'Settings'),
        # newly added
        ("currency", "Currency"),
        ("discount", "Discount"),

        # School MIS modules
        ('employees', 'Employees'),
        ('sales', 'Sales'),

        # ('vendors', 'Vendors'),
        # ("members", "Members"),
        # ("employees", "Employees"),

    ]

    action = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    module = models.CharField(max_length=50, choices=MODULES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'permissions'
        unique_together = ['module', 'action']
        indexes = [
            models.Index(fields=['module']),
        ]

    @property
    def codename(self):
        return f"{self.module}.{self.action}"
    
    def __str__(self):
        return self.codename
