import apiClient from '@/lib/api';

import type {
  DailySalesReportRow,
  MonthlySalesSummaryRow,
  SalesByFuelTypeRow,
  SalesReportFilters,
} from '../types/reports';

const SALES_REPORTS_ENDPOINT = '/sales-reports/';

export const salesReportsService = {
  getDailySales: (params?: SalesReportFilters) =>
    apiClient.get<DailySalesReportRow[]>(`${SALES_REPORTS_ENDPOINT}daily/`, { params }),
  getMonthlySummary: (params?: SalesReportFilters) =>
    apiClient.get<MonthlySalesSummaryRow[]>(`${SALES_REPORTS_ENDPOINT}monthly-summary/`, { params }),
  getByFuelType: (params?: SalesReportFilters) =>
    apiClient.get<SalesByFuelTypeRow[]>(`${SALES_REPORTS_ENDPOINT}by-fuel/`, { params }),
};

export default salesReportsService;
