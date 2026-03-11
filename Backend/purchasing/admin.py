from django.contrib import admin

from .models import OrderPurchase, Purchase, Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('supplier_id', 'supplier_name', 'phone')
    search_fields = ('supplier_name', 'phone', 'address')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        'purchase_id',
        'supplier',
        'fuel',
        'purchase_date',
        'amount_ton',
        'unit_price',
        'paid_currency',
        'paid_amount_in_purchase_currency',
        'currency_rate',
        'total_amount_in_base_currency',
    )
    search_fields = ('invoice_number', 'supplier__supplier_name', 'fuel__fuel_name')
    list_filter = ('purchase_date', 'currency', 'paid_currency', 'supplier')


@admin.register(OrderPurchase)
class OrderPurchaseAdmin(admin.ModelAdmin):
    list_display = (
        'order_purchase_id',
        'order_id',
        'supplier',
        'date',
        'amount_per_ton',
        'purchase_price',
    )
    search_fields = ('order_id', 'supplier__supplier_name', 'description')
    list_filter = ('date', 'currency', 'supplier')
