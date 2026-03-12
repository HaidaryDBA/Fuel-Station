from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import PermissionMixin

from .services import (
    get_cash_and_exchange_balances,
    get_tank_inventory_status,
    get_today_sales_overview,
    get_today_sales_summary,
)


class DashboardSummaryView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'

    def get(self, request):
        balances = get_cash_and_exchange_balances()
        payload = {
            'cash_accounts': balances['cash_accounts'],
            'exchange_accounts': balances['exchange_accounts'],
            'today_sales': get_today_sales_overview(),
        }
        return Response(payload)


class TankInventoryStatusView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'

    def get(self, request):
        return Response(get_tank_inventory_status())


class TodaySalesByFuelView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'

    def get(self, request):
        return Response(get_today_sales_summary())
