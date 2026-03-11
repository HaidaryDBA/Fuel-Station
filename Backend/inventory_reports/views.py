from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import PermissionMixin

from .services import (
    get_fuel_movement_report,
    get_fuel_stock_summary,
    get_tank_status_report,
)


def _get_filters(request):
    return {
        'start_date': request.query_params.get('start_date'),
        'end_date': request.query_params.get('end_date'),
        'fuel_type': request.query_params.get('fuel_type'),
    }


class BaseInventoryReportView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'


class TankStatusReportView(BaseInventoryReportView):
    def get(self, request):
        return Response(get_tank_status_report(_get_filters(request)))


class FuelStockSummaryView(BaseInventoryReportView):
    def get(self, request):
        return Response(get_fuel_stock_summary(_get_filters(request)))


class FuelMovementReportView(BaseInventoryReportView):
    def get(self, request):
        return Response(get_fuel_movement_report(_get_filters(request)))
