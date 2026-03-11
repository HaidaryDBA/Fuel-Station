import { useQuery } from '@tanstack/react-query';

import reportsService from '../services/reportsService';
import salesReportsService from '../services/salesReportsService';
import inventoryReportsService from '../services/inventoryReportsService';
import financeReportsService from '../services/financeReportsService';
import type { ReportFilters } from '../types/reports';
import type { SalesReportFilters } from '../types/reports';
import type { InventoryReportFilters } from '../types/reports';
import type { FinanceReportFilters } from '../types/reports';
import { reportKeys } from './reportKeys';

export const useReportsOverview = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.overview(filters),
    queryFn: () => reportsService.getOverview(filters).then((res) => res.data),
  });

export const useTankStockReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.tankStock(filters),
    queryFn: () => reportsService.getTankStock(filters).then((res) => res.data),
  });

export const useAccountBalancesReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.accountBalances(filters),
    queryFn: () => reportsService.getAccountBalances(filters).then((res) => res.data),
  });

export const useSalesDailyReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.salesDaily(filters),
    queryFn: () => reportsService.getSalesDaily(filters).then((res) => res.data),
  });

export const useOutstandingLendingsReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.outstandingLendings(filters),
    queryFn: () => reportsService.getOutstandingLendings(filters).then((res) => res.data),
  });

export const useDueSoonLendingsReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.dueSoonLendings(filters),
    queryFn: () => reportsService.getDueSoonLendings(filters).then((res) => res.data),
  });

export const usePurchaseSummaryReport = (filters?: ReportFilters) =>
  useQuery({
    queryKey: reportKeys.purchaseSummary(filters),
    queryFn: () => reportsService.getPurchaseSummary(filters).then((res) => res.data),
  });

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
