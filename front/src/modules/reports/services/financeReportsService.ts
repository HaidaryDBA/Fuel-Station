import apiClient from '@/lib/api';

import type { FinanceAccountBalanceRow, FinanceReportFilters, MoneyFlowRow } from '../types/reports';

const FINANCE_REPORTS_ENDPOINT = '/finance-reports/';

export const financeReportsService = {
  getAccountBalances: (params?: FinanceReportFilters) =>
    apiClient.get<FinanceAccountBalanceRow[]>(`${FINANCE_REPORTS_ENDPOINT}account-balances/`, { params }),
  getMoneyFlow: (params?: FinanceReportFilters) =>
    apiClient.get<MoneyFlowRow[]>(`${FINANCE_REPORTS_ENDPOINT}money-flow/`, { params }),
};

export default financeReportsService;
