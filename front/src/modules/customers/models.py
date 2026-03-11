from django.db import models

from core.base_models import BaseModel


class Customer(BaseModel):
    first_name = models.CharField(max_length=150, db_index=True)
    last_name = models.CharField(max_length=150, db_index=True)
    photo = models.ImageField(upload_to='customers/photos/', blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'customer_profiles'
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
        ]

    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

