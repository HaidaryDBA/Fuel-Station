from datetime import date
from decimal import Decimal
import json
import re
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from rest_framework import serializers

from accounts.models import ROLE_CHOICES

from .models import Customer, Employee, Partners


User = get_user_model()
VALID_ROLES = [role for role, _ in ROLE_CHOICES]
WEEKDAY_CHOICES = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
]


def generate_employee_username(first_name: str, last_name: str) -> str:
    base = slugify(f'{first_name}.{last_name}') or 'employee'
    base = base[:140]

    while True:
        suffix = uuid4().hex[:8]
        candidate = f'{base}-{suffix}'
        if not User.objects.filter(username=candidate).exists():
            return candidate


class FlexibleDateField(serializers.DateField):
    """
    Accepts Gregorian and Persian (Jalali) dates in YYYY-MM-DD or YYYY/MM/DD format.
    Persian dates are converted to Gregorian for database storage.
    """

    def to_internal_value(self, value):
        if isinstance(value, date):
            return value

        if isinstance(value, str):
            normalized = value.strip().replace('/', '-')
            if re.match(r'^\d{4}-\d{2}-\d{2}$', normalized):
                year, month, day = map(int, normalized.split('-'))
                try:
                    # Assume Jalali for years below 1700, Gregorian otherwise.
                    if year < 1700:
                        return jalali_to_gregorian_date(year, month, day)
                    return date(year, month, day)
                except ValueError:
                    raise serializers.ValidationError(
                        'Date must be valid Gregorian or Persian format (YYYY-MM-DD).'
                    )

        raise serializers.ValidationError(
            'Date must be valid Gregorian or Persian format (YYYY-MM-DD).'
        )


def jalali_to_gregorian_date(jy: int, jm: int, jd: int) -> date:
    if jm < 1 or jm > 12:
        raise ValueError('Invalid Jalali month')
    if jd < 1 or jd > 31:
        raise ValueError('Invalid Jalali day')

    g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

    jy -= 979
    jm -= 1
    jd -= 1

    j_day_no = 365 * jy + (jy // 33) * 8 + ((jy % 33) + 3) // 4
    for i in range(jm):
        j_day_no += j_days_in_month[i]
    j_day_no += jd

    g_day_no = j_day_no + 79

    gy = 1600 + 400 * (g_day_no // 146097)
    g_day_no %= 146097

    leap = True
    if g_day_no >= 36525:
        g_day_no -= 1
        gy += 100 * (g_day_no // 36524)
        g_day_no %= 36524

        if g_day_no >= 365:
            g_day_no += 1
        else:
            leap = False

    gy += 4 * (g_day_no // 1461)
    g_day_no %= 1461

    if g_day_no >= 366:
        leap = False
        g_day_no -= 1
        gy += g_day_no // 365
        g_day_no %= 365

    month = 0
    while month < 12 and g_day_no >= g_days_in_month[month] + (1 if month == 1 and leap else 0):
        g_day_no -= g_days_in_month[month] + (1 if month == 1 and leap else 0)
        month += 1

    gm = month + 1
    gd = g_day_no + 1
    return date(gy, gm, gd)


class EmployeeListSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    role = serializers.CharField(source='user.role_name', read_only=True)

    work_days = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone',
            'role',
            'father_name',
            'address',
            'salary',
            'work_days',
            'join_date',
            'membership_type',
            'status',
            'picture',
            'created_at',
            'updated_at',
        ]

    def get_work_days(self, obj):
        try:
            value = json.loads(obj.work_days)
        except (TypeError, ValueError):
            value = []
        return value if isinstance(value, list) else []


class EmployeeDetailSerializer(EmployeeListSerializer):
    pass


class EmployeeWriteSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    role = serializers.ChoiceField(choices=VALID_ROLES)
    status = serializers.ChoiceField(choices=[choice for choice, _ in Employee.STATUS_CHOICES])
    work_days = serializers.ListField(
        child=serializers.ChoiceField(choices=WEEKDAY_CHOICES),
        allow_empty=False,
    )
    picture = serializers.ImageField(required=False, allow_null=True)
    join_date = FlexibleDateField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'father_name',
            'address',
            'phone',
            'salary',
            'work_days',
            'join_date',
            'membership_type',
            'role',
            'status',
            'picture',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError('Salary cannot be negative.')
        return value

    def validate_work_days(self, value):
        if not value:
            raise serializers.ValidationError('At least one work day is required.')
        deduplicated = []
        for day in value:
            if day not in deduplicated:
                deduplicated.append(day)
        return deduplicated

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        phone = validated_data.pop('phone')
        role = validated_data.pop('role')

        user_data = {
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'email': '',
            'username': generate_employee_username(first_name=first_name, last_name=last_name),
            'role_name': role,
        }
        status = validated_data.get('status', Employee.STATUS_ACTIVE)

        work_days = validated_data.pop('work_days')
        user = User.objects.create_user(
            **user_data,
            password=None,
            is_active=status == Employee.STATUS_ACTIVE,
        )
        employee = Employee.objects.create(
            user=user,
            work_days=json.dumps(work_days),
            **validated_data,
        )
        return employee

    def update(self, instance, validated_data):
        user = instance.user

        user.first_name = validated_data.pop('first_name', user.first_name)
        user.last_name = validated_data.pop('last_name', user.last_name)
        user.phone = validated_data.pop('phone', user.phone)
        user.role_name = validated_data.pop('role', user.role_name)

        status = validated_data.get('status', instance.status)
        user.is_active = status == Employee.STATUS_ACTIVE
        user.save()

        for attr, value in validated_data.items():
            if attr == 'work_days':
                value = json.dumps(value)
            setattr(instance, attr, value)
        instance.save()
        return instance


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'phone',
            'email',
            'address',
            'gender',
            'total_purchases',
            'discount_percent',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'created_at', 'updated_at']

    def validate_total_purchases(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError('Total purchases cannot be negative.')
        return value

    def validate_discount_percent(self, value):
        if value < Decimal('0.00') or value > Decimal('100.00'):
            raise serializers.ValidationError('Discount percent must be between 0 and 100.')
        return value


class PartnerSerializer(serializers.ModelSerializer):
    main_address = serializers.CharField(source='mean_address')
    date_of_birth = FlexibleDateField(source='DOB')
    join_date = FlexibleDateField(source='Join_date')
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Partners
        fields = [
            'id',
            'first_name',
            'father_name',
            'last_name',
            'phone',
            'main_address',
            'current_address',
            'date_of_birth',
            'share_percentage',
            'join_date',
            'full_name',
        ]
        read_only_fields = ['id', 'full_name']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()

    def validate_phone(self, value):
        normalized = value.strip()
        if not normalized.isdigit() or len(normalized) != 10:
            raise serializers.ValidationError('Phone number must be exactly 10 digits.')
        return normalized

    def validate_date_of_birth(self, value):
        if value >= timezone.localdate():
            raise serializers.ValidationError('Date of birth must be in the past.')
        return value

    def validate_share_percentage(self, value):
        if value < Decimal('0.00') or value > Decimal('100.00'):
            raise serializers.ValidationError('Share percentage must be between 0 and 100.')
        return value

    def validate(self, attrs):
        date_of_birth = attrs.get('DOB', getattr(self.instance, 'DOB', None))
        join_date = attrs.get('Join_date', getattr(self.instance, 'Join_date', None))
        today = timezone.localdate()

        if join_date and join_date > today:
            raise serializers.ValidationError({'join_date': 'Join date cannot be in the future.'})

        if date_of_birth and join_date and join_date < date_of_birth:
            raise serializers.ValidationError({'join_date': 'Join date cannot be earlier than date of birth.'})

        share_percentage = attrs.get(
            'share_percentage',
            getattr(self.instance, 'share_percentage', Decimal('0.00')),
        )
        queryset = Partners.objects.all()
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)

        total_without_current = (
            queryset.aggregate(total=models.Sum('share_percentage')).get('total') or Decimal('0.00')
        )
        total_without_current = total_without_current.quantize(Decimal('0.01'))

        if self.instance is None and total_without_current >= Decimal('100.00'):
            raise serializers.ValidationError(
                {
                    'share_percentage': (
                        'Total share is already 100.00. '
                        'Edit an existing partner to reduce share before adding a new partner.'
                    )
                }
            )

        resulting_total = (total_without_current + share_percentage).quantize(Decimal('0.01'))
        if resulting_total > Decimal('100.00'):
            raise serializers.ValidationError(
                {
                    'share_percentage': (
                        f'Total share percentage cannot exceed 100.00. Current total would be {resulting_total}.'
                    )
                }
            )

        return attrs
