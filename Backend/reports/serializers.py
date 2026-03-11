from rest_framework import serializers


class DailySeriesPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    quantity = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    total_amount = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    total_amount_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    total_paid_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    total_remaining_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    count = serializers.IntegerField(required=False)


class TankStockReportRowSerializer(serializers.Serializer):
    tank_id = serializers.IntegerField()
    tank_number = serializers.IntegerField()
    fuel_id = serializers.IntegerField()
    fuel_name = serializers.CharField()
    capacity = serializers.DecimalField(max_digits=18, decimal_places=2)
    current_liters = serializers.DecimalField(max_digits=18, decimal_places=2)
    remaining_capacity = serializers.DecimalField(max_digits=18, decimal_places=2)
    min_level_alert = serializers.IntegerField()
    low_stock = serializers.BooleanField()


class AccountBalanceReportRowSerializer(serializers.Serializer):
    account_id = serializers.IntegerField()
    account_name = serializers.CharField()
    account_type = serializers.CharField()
    currency_id = serializers.IntegerField()
    currency_code = serializers.CharField()
    native_balance = serializers.DecimalField(max_digits=18, decimal_places=2)
    base_balance = serializers.DecimalField(max_digits=18, decimal_places=2)


class OutstandingLendingRowSerializer(serializers.Serializer):
    lending_id = serializers.IntegerField()
    customer_name = serializers.CharField()
    fuel_name = serializers.CharField()
    tank_name = serializers.CharField(allow_blank=True)
    sale_date = serializers.DateField()
    end_date = serializers.DateField()
    total_amount = serializers.DecimalField(max_digits=18, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=18, decimal_places=2)
    remaining_amount = serializers.DecimalField(max_digits=18, decimal_places=2)
    status = serializers.CharField()


class PurchaseSummaryRowSerializer(serializers.Serializer):
    date = serializers.DateField()
    liters = serializers.DecimalField(max_digits=18, decimal_places=2)
    total_amount_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2)
    total_paid_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2)
    total_remaining_in_base_currency = serializers.DecimalField(max_digits=18, decimal_places=2)
    count = serializers.IntegerField()
