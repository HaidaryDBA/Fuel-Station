import { useQuery } from '@tanstack/react-query';

import salesReportsService from '../services/salesReportsService';
import inventoryReportsService from '../services/inventoryReportsService';
import financeReportsService from '../services/financeReportsService';
import type { SalesReportFilters } from '../types/reports';
import type { InventoryReportFilters } from '../types/reports';
import type { FinanceReportFilters } from '../types/reports';
import { reportKeys } from './reportKeys';

export const useDailySalesReport = (filters?: SalesReportFilters) =>
  useQuery({
    queryKey: reportKeys.salesReportDaily(filters),
    queryFn: () => salesReportsService.getDailySales(filters).then((res) => res.data),
  });

export const useMonthlySalesSummary = (filters?: SalesReportFilters) =>
  useQuery({
    queryKey: reportKeys.salesReportMonthly(filters),
    queryFn: () => salesReportsService.getMonthlySummary(filters).then((res) => res.data),
  });

export const useSalesByFuelTypeReport = (filters?: SalesReportFilters) =>
  useQuery({
    queryKey: reportKeys.salesReportByFuel(filters),
    queryFn: () => salesReportsService.getByFuelType(filters).then((res) => res.data),
  });

export const useInventoryTankStatusReport = (filters?: InventoryReportFilters) =>
  useQuery({
    queryKey: reportKeys.inventoryTankStatus(filters),
    queryFn: () => inventoryReportsService.getTankStatus(filters).then((res) => res.data),
  });

export const useInventoryFuelStockReport = (filters?: InventoryReportFilters) =>
  useQuery({
    queryKey: reportKeys.inventoryFuelStock(filters),
    queryFn: () => inventoryReportsService.getFuelStock(filters).then((res) => res.data),
  });

export const useInventoryMovementsReport = (filters?: InventoryReportFilters) =>
  useQuery({
    queryKey: reportKeys.inventoryMovements(filters),
    queryFn: () => inventoryReportsService.getMovements(filters).then((res) => res.data),
  });

export const useFinanceAccountBalancesReport = (filters?: FinanceReportFilters) =>
  useQuery({
    queryKey: reportKeys.financeAccountBalances(filters),
    queryFn: () => financeReportsService.getAccountBalances(filters).then((res) => res.data),
  });

export const useFinanceMoneyFlowReport = (filters?: FinanceReportFilters) =>
  useQuery({
    queryKey: reportKeys.financeMoneyFlow(filters),
    queryFn: () => financeReportsService.getMoneyFlow(filters).then((res) => res.data),
  });
