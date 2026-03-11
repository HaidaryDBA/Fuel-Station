import apiClient from '@/lib/api';

import type { DashboardSummary } from '../types/dashboard';

const DASHBOARD_ENDPOINT = '/dashboard/';

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummary>(`${DASHBOARD_ENDPOINT}summary/`),
};

export default dashboardService;
