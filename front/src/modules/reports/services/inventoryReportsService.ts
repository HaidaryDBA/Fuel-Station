import apiClient from '@/lib/api';

import type {
  FuelMovementRow,
  FuelStockSummaryRow,
  InventoryReportFilters,
  TankStatusReportRow,
} from '../types/reports';

const INVENTORY_REPORTS_ENDPOINT = '/inventory-reports/';

export const inventoryReportsService = {
  getTankStatus: (params?: InventoryReportFilters) =>
    apiClient.get<TankStatusReportRow[]>(`${INVENTORY_REPORTS_ENDPOINT}tank-status/`, { params }),
  getFuelStock: (params?: InventoryReportFilters) =>
    apiClient.get<FuelStockSummaryRow[]>(`${INVENTORY_REPORTS_ENDPOINT}fuel-stock/`, { params }),
  getMovements: (params?: InventoryReportFilters) =>
    apiClient.get<FuelMovementRow[]>(`${INVENTORY_REPORTS_ENDPOINT}movements/`, { params }),
};

export default inventoryReportsService;
