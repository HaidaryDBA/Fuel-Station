from django.contrib import admin

from .models import Account, Currency, CurrencyRate, Expense, FinancialTransaction, PartnerDebt, Salary


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'symbol', 'is_base', 'is_active')
    list_filter = ('is_base', 'is_active')
    search_fields = ('code', 'name', 'symbol')
    ordering = ('code',)


@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_currency', 'to_currency', 'rate_value', 'date', 'created_by')
    list_filter = ('date', 'from_currency', 'to_currency')
    search_fields = ('from_currency__code', 'to_currency__code', 'created_by__username')
    autocomplete_fields = ('from_currency', 'to_currency')
    raw_id_fields = ('created_by',)
    ordering = ('-date', '-id')


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'account_type', 'currency', 'is_active')
    list_filter = ('account_type', 'currency', 'is_active')
    search_fields = ('name', 'currency__code', 'currency__name')
    autocomplete_fields = ('currency',)
    ordering = ('name', 'id')


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'year', 'month', 'base_salary', 'bonus', 'net_salary', 'pay_date')
    list_filter = ('year', 'month', 'pay_date')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'description')
    autocomplete_fields = ('employee',)
    ordering = ('-pay_date', '-id')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'currency', 'pay_date')
    list_filter = ('currency', 'pay_date')
    search_fields = ('title', 'description', 'currency__code')
    autocomplete_fields = ('currency',)
    ordering = ('-pay_date', '-id')


@admin.register(PartnerDebt)
class PartnerDebtAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'partner',
        'amount_money',
        'total_in',
        'paid_amount',
        'status',
        'currency',
        'date',
        'created_by',
        'updated_by',
    )
    list_filter = ('currency', 'date', 'paid_date')
    search_fields = ('partner__first_name', 'partner__last_name', 'description')
    autocomplete_fields = ('partner', 'currency')
    ordering = ('-date', '-id')


@admin.register(FinancialTransaction)
class FinancialTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'transaction_type',
        'from_account',
        'to_account',
        'amount',
        'currency',
        'date_time',
        'created_by',
    )
    list_filter = ('transaction_type', 'currency', 'date_time')
    search_fields = (
        'from_account__name',
        'to_account__name',
        'description',
        'reference_type',
        'created_by__username',
    )
    autocomplete_fields = ('from_account', 'to_account', 'currency')
    raw_id_fields = ('created_by', 'updated_by')
    ordering = ('-date_time', '-id')
