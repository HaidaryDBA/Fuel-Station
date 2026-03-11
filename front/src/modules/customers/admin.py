from django.contrib import admin

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'gender',
        'total_purchases',
        'discount_percent',
        'is_active',
        'created_at',
    ]
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    list_filter = ['gender', 'is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

