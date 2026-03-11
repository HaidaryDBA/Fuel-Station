from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import PermissionMixin

from .services import get_account_balance_report, get_money_flow_report


def _get_filters(request):
    return {
        'start_date': request.query_params.get('start_date'),
        'end_date': request.query_params.get('end_date'),
        'account_id': request.query_params.get('account_id'),
    }


class BaseFinanceReportView(PermissionMixin, APIView):
    permission_classes = [IsAuthenticated]
    permission_module = 'reports'


class AccountBalanceReportView(BaseFinanceReportView):
    def get(self, request):
        return Response(get_account_balance_report(_get_filters(request)))


class MoneyFlowReportView(BaseFinanceReportView):
    def get(self, request):
        return Response(get_money_flow_report(_get_filters(request)))
