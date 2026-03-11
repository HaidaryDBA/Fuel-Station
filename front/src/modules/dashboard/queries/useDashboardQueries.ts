import { useQuery } from '@tanstack/react-query';

import dashboardService from '../services/dashboardService';
import { dashboardKeys } from './dashboardKeys';

export const useDashboardSummary = () =>
  useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary().then((res) => res.data),
  });
