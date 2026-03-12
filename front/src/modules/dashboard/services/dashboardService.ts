import apiClient from '@/lib/api';

import type {
  DashboardSummary,
  DashboardTankStatus,
  DashboardTodaySalesByFuel,
} from '../types/dashboard';

const DASHBOARD_ENDPOINT = '/dashboard/';

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummary>(`${DASHBOARD_ENDPOINT}summary/`),
  getTankStatus: () => apiClient.get<DashboardTankStatus[]>(`${DASHBOARD_ENDPOINT}tank-status/`),
  getTodaySalesByFuel: () =>
    apiClient.get<DashboardTodaySalesByFuel[]>(`${DASHBOARD_ENDPOINT}today-sales/`),
};

export default dashboardService;
