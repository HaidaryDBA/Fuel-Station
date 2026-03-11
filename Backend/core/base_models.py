
from django.db import models
from .managers import SoftDeleteManager
from django.utils import timezone


class BaseModel(models.Model):
    """Base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Manager that includes soft-deleted objects
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the object"""
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore soft-deleted object"""
        self.deleted_at = None
        self.save()
