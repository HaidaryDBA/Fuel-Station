from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import PermissionMixin

from .services import (
    get_daily_sales_report,
    get_monthly_sales_summary,
    get_sales_by_fuel_type,
)


def _get_filters(request):
    return {
        'start_date': request.query_params.get('start_date'),
        'end_date': request.query_params.get('end_date'),
        'fuel_type': request.query_params.get('fuel_type'),
    }


class BaseSalesReportView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'


class DailySalesReportView(BaseSalesReportView):
    def get(self, request):
        return Response(get_daily_sales_report(_get_filters(request)))


class MonthlySalesSummaryView(BaseSalesReportView):
    def get(self, request):
        return Response(get_monthly_sales_summary(_get_filters(request)))


class SalesByFuelTypeView(BaseSalesReportView):
    def get(self, request):
        return Response(get_sales_by_fuel_type(_get_filters(request)))
