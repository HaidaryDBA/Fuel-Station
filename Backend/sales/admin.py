from django.contrib import admin

from .models import Lending, Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_id', 'fuel', 'motor', 'sale_date', 'amount', 'unit_price', 'currency')
    list_filter = ('sale_date', 'fuel', 'currency')
    search_fields = ('sale_id', 'fuel__fuel_name', 'motor__motor_name')


@admin.register(Lending)
class LendingAdmin(admin.ModelAdmin):
    list_display = ('lending_id', 'customer', 'fuel', 'sale_date', 'end_date', 'paid_amount', 'status')
    list_filter = ('status', 'sale_date', 'end_date', 'fuel')
    search_fields = ('lending_id', 'customer__first_name', 'customer__last_name', 'customer__phone')
