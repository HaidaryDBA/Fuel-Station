import apiClient from '@/lib/api';

import type {
  CurrencyOption,
  CustomerOption,
  FuelOption,
  Lending,
  LendingFormValues,
  LendingListParams,
  LendingSummary,
  MotorOption,
  PaginatedResponse,
  Sale,
  SaleFormValues,
  SaleListParams,
  SaleSummary,
  TankOption,
} from '../types/sale';

const SALES_ENDPOINT = '/sales/sales/';
const LENDINGS_ENDPOINT = '/sales/lendings/';
const FUELS_ENDPOINT = '/inventory/fuel/';
const MOTORS_ENDPOINT = '/inventory/fuel-motor/';
const TANKS_ENDPOINT = '/inventory/tank-storage/';
const CURRENCIES_ENDPOINT = '/financial/currencies/';
const CUSTOMERS_ENDPOINT = '/employees/customers/';

export const saleService = {
  getSales: (params?: SaleListParams) => apiClient.get<PaginatedResponse<Sale>>(SALES_ENDPOINT, { params }),
  getSale: (id: number) => apiClient.get<Sale>(`${SALES_ENDPOINT}${id}/`),
  getSummary: (params?: SaleListParams) => apiClient.get<SaleSummary>(`${SALES_ENDPOINT}summary/`, { params }),
  createSale: (payload: SaleFormValues) => apiClient.post<Sale>(SALES_ENDPOINT, payload),
  updateSale: (id: number, payload: SaleFormValues) => apiClient.patch<Sale>(`${SALES_ENDPOINT}${id}/`, payload),
  deleteSale: (id: number) => apiClient.delete(`${SALES_ENDPOINT}${id}/`),
};

export const lendingService = {
  getLendings: (params?: LendingListParams) =>
    apiClient.get<PaginatedResponse<Lending>>(LENDINGS_ENDPOINT, { params }),
  getLending: (id: number) => apiClient.get<Lending>(`${LENDINGS_ENDPOINT}${id}/`),
  getSummary: (params?: LendingListParams) =>
    apiClient.get<LendingSummary>(`${LENDINGS_ENDPOINT}summary/`, { params }),
  createLending: (payload: LendingFormValues) => apiClient.post<Lending>(LENDINGS_ENDPOINT, payload),
  updateLending: (id: number, payload: LendingFormValues) =>
    apiClient.patch<Lending>(`${LENDINGS_ENDPOINT}${id}/`, payload),
  deleteLending: (id: number) => apiClient.delete(`${LENDINGS_ENDPOINT}${id}/`),
};

export const salesLookupService = {
  getFuels: () => apiClient.get<PaginatedResponse<FuelOption>>(FUELS_ENDPOINT, { params: { page_size: 300 } }),
  getMotors: () => apiClient.get<PaginatedResponse<MotorOption>>(MOTORS_ENDPOINT, { params: { page_size: 300 } }),
  getTanks: () => apiClient.get<PaginatedResponse<TankOption>>(TANKS_ENDPOINT, { params: { page_size: 300 } }),
  getCurrencies: () =>
    apiClient.get<PaginatedResponse<CurrencyOption>>(CURRENCIES_ENDPOINT, { params: { page_size: 300 } }),
  getCustomers: () =>
    apiClient.get<PaginatedResponse<CustomerOption>>(CUSTOMERS_ENDPOINT, { params: { page_size: 300 } }),
};
