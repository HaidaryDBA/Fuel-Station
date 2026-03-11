from django.contrib import admin

from .models import Customer, Employee, Partners


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_full_name',
        'get_phone',
        'get_role',
        'membership_type',
        'status',
        'join_date',
    )
    list_filter = ('status', 'membership_type', 'join_date', 'user__role_name')
    search_fields = (
        'user__first_name',
        'user__last_name',
        'father_name',
        'user__phone',
    )
    ordering = ('-created_at',)

    @admin.display(description='Full name')
    def get_full_name(self, obj):
        return obj.user.get_full_name()

    @admin.display(description='Phone')
    def get_phone(self, obj):
        return obj.user.phone

    @admin.display(description='Role')
    def get_role(self, obj):
        return obj.user.role_name
    

# partners section 
class PartnersAdmin(admin.ModelAdmin):
    list_display = ("first_name",'father_name','last_name','phone','share_percentage')
    search_fields =(
        'first_name','father_name','last_name'
    )
    list_filter = (
        'current_address','mean_address','first_name'
    )

admin.site.register(Partners,PartnersAdmin)


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
