from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from rest_framework.exceptions import ValidationError

from core.base_models import BaseModel
from core.utils import upload_image_path


def employee_picture_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name='employees',
        instance_field_name='id'
    )


class Employee(BaseModel):
    MEMBERSHIP_PERMANENT = 'permanent'
    MEMBERSHIP_CONTRACT = 'contract'
    MEMBERSHIP_INTERN = 'intern'
    MEMBERSHIP_CHOICES = [
        (MEMBERSHIP_PERMANENT, 'Permanent'),
        (MEMBERSHIP_CONTRACT, 'Contract'),
        (MEMBERSHIP_INTERN, 'Intern'),
    ]

    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'فعال'),
        (STATUS_INACTIVE, 'غیر فعال'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='employee_profile',
    )
    father_name = models.CharField(max_length=150)
    address = models.TextField()
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    work_days = models.TextField(default='[]')
    join_date = models.DateField()
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    picture = models.ImageField(
        upload_to=employee_picture_upload_path,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'employees'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['membership_type']),
            models.Index(fields=['join_date']),
        ]

    def __str__(self):
        return self.user.get_full_name() or f"Employee {self.pk}"

class Partners(models.Model):
    first_name = models.CharField(max_length=64)
    father_name =models.CharField(max_length=64)
    last_name =models.CharField(max_length=64)
    phone = models.CharField(max_length=10,unique=True)
    mean_address = models.CharField(max_length=255)
    current_address = models.CharField(max_length=255)
    DOB = models.DateField()
    share_percentage = models.DecimalField(max_digits=100,decimal_places=2)
    Join_date = models.DateField()

    class Meta:
        db_table = 'Partners'
        unique_together = ['first_name','father_name']
    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Customer(BaseModel):
    GENDER_MALE = 'male'
    GENDER_FEMALE = 'female'
    GENDER_OTHER = 'other'

    GENDER_CHOICES = [
        (GENDER_MALE, 'Male'),
        (GENDER_FEMALE, 'Female'),
        (GENDER_OTHER, 'Other'),
    ]

    first_name = models.CharField(max_length=150, db_index=True)
    last_name = models.CharField(max_length=150, db_index=True)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default=GENDER_OTHER, db_index=True)
    total_purchases = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'customer_profiles'
        indexes = [
            models.Index(fields=['first_name', 'last_name']),
            models.Index(fields=['total_purchases']),
        ]

    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()
