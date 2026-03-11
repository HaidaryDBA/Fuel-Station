import apiClient from '@/lib/api';

import type {
  AccountBalancesReportResponse,
  DueSoonLendingReportResponse,
  OutstandingLendingReportResponse,
  PurchaseSummaryReportResponse,
  ReportFilters,
  ReportsOverview,
  SalesDailyReportResponse,
  TankStockReportResponse,
} from '../types/reports';

const REPORTS_ENDPOINT = '/reports/';

export const reportsService = {
  getOverview: (params?: ReportFilters) => apiClient.get<ReportsOverview>(`${REPORTS_ENDPOINT}overview/`, { params }),
  getTankStock: (params?: ReportFilters) =>
    apiClient.get<TankStockReportResponse>(`${REPORTS_ENDPOINT}inventory/stock/`, { params }),
  getAccountBalances: (params?: ReportFilters) =>
    apiClient.get<AccountBalancesReportResponse>(`${REPORTS_ENDPOINT}finance/account-balances/`, { params }),
  getSalesDaily: (params?: ReportFilters) =>
    apiClient.get<SalesDailyReportResponse>(`${REPORTS_ENDPOINT}sales/daily/`, { params }),
  getOutstandingLendings: (params?: ReportFilters) =>
    apiClient.get<OutstandingLendingReportResponse>(`${REPORTS_ENDPOINT}lendings/outstanding/`, { params }),
  getDueSoonLendings: (params?: ReportFilters) =>
    apiClient.get<DueSoonLendingReportResponse>(`${REPORTS_ENDPOINT}lendings/due-soon/`, { params }),
  getPurchaseSummary: (params?: ReportFilters) =>
    apiClient.get<PurchaseSummaryReportResponse>(`${REPORTS_ENDPOINT}purchases/summary/`, { params }),
  exportCsv: (reportKey: string, params?: ReportFilters) =>
    apiClient.get(`${REPORTS_ENDPOINT}exports/${reportKey}/csv/`, {
      params,
      responseType: 'blob',
    }),
};

export default reportsService;
