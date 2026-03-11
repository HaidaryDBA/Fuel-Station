from django.db import models
from django.contrib.auth.models import UserManager


class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted objects by default"""
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.model, 'deleted_at'):
            return queryset.filter(deleted_at__isnull=True)
        return queryset
