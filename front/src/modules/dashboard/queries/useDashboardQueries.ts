import { useQuery } from '@tanstack/react-query';

import dashboardService from '../services/dashboardService';
import { dashboardKeys } from './dashboardKeys';

export const useDashboardSummary = () =>
  useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary().then((res) => res.data),
  });

export const useDashboardTankStatus = () =>
  useQuery({
    queryKey: dashboardKeys.tankStatus(),
    queryFn: () => dashboardService.getTankStatus().then((res) => res.data),
  });

export const useDashboardTodaySalesByFuel = () =>
  useQuery({
    queryKey: dashboardKeys.todaySales(),
    queryFn: () => dashboardService.getTodaySalesByFuel().then((res) => res.data),
  });
