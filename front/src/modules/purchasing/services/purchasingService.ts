import apiClient from '@/lib/api';

import type {
  CurrencyOption,
  CurrencyRateOption,
  FuelOption,
  OrderPurchase,
  OrderPurchaseFormValues,
  OrderPurchaseListParams,
  PaginatedResponse,
  PartnerOption,
  Purchase,
  PurchaseFormValues,
  PurchaseListParams,
  Supplier,
  SupplierFormValues,
  SupplierListParams,
  TankOption,
} from '../types/purchasing';

const SUPPLIERS_ENDPOINT = '/purchasing/suppliers/';
const PURCHASES_ENDPOINT = '/purchasing/purchases/';
const ORDER_PURCHASES_ENDPOINT = '/purchasing/order-purchases/';
const FUELS_ENDPOINT = '/inventory/fuel/';
const PARTNERS_ENDPOINT = '/employees/partners/';
const CURRENCIES_ENDPOINT = '/financial/currencies/';
const CURRENCY_RATES_ENDPOINT = '/financial/currency-rates/';
const TANKS_ENDPOINT = '/inventory/tank-storage/';

export const supplierService = {
  getSuppliers: (params?: SupplierListParams) =>
    apiClient.get<PaginatedResponse<Supplier>>(SUPPLIERS_ENDPOINT, { params }),

  getSupplier: (id: number) => apiClient.get<Supplier>(`${SUPPLIERS_ENDPOINT}${id}/`),

  createSupplier: (payload: SupplierFormValues) => apiClient.post<Supplier>(SUPPLIERS_ENDPOINT, payload),

  updateSupplier: (id: number, payload: SupplierFormValues) =>
    apiClient.patch<Supplier>(`${SUPPLIERS_ENDPOINT}${id}/`, payload),

  deleteSupplier: (id: number) => apiClient.delete(`${SUPPLIERS_ENDPOINT}${id}/`),
};

export const purchaseService = {
  getPurchases: (params?: PurchaseListParams) =>
    apiClient.get<PaginatedResponse<Purchase>>(PURCHASES_ENDPOINT, { params }),

  getPurchase: (id: number) => apiClient.get<Purchase>(`${PURCHASES_ENDPOINT}${id}/`),

  createPurchase: (payload: PurchaseFormValues) => apiClient.post<Purchase>(PURCHASES_ENDPOINT, payload),

  updatePurchase: (id: number, payload: PurchaseFormValues) =>
    apiClient.patch<Purchase>(`${PURCHASES_ENDPOINT}${id}/`, payload),

  deletePurchase: (id: number) => apiClient.delete(`${PURCHASES_ENDPOINT}${id}/`),
};

export const orderPurchaseService = {
  getOrderPurchases: (params?: OrderPurchaseListParams) =>
    apiClient.get<PaginatedResponse<OrderPurchase>>(ORDER_PURCHASES_ENDPOINT, { params }),

  getOrderPurchase: (id: number) => apiClient.get<OrderPurchase>(`${ORDER_PURCHASES_ENDPOINT}${id}/`),

  createOrderPurchase: (payload: OrderPurchaseFormValues) =>
    apiClient.post<OrderPurchase>(ORDER_PURCHASES_ENDPOINT, payload),

  updateOrderPurchase: (id: number, payload: OrderPurchaseFormValues) =>
    apiClient.patch<OrderPurchase>(`${ORDER_PURCHASES_ENDPOINT}${id}/`, payload),

  deleteOrderPurchase: (id: number) => apiClient.delete(`${ORDER_PURCHASES_ENDPOINT}${id}/`),
};

export const purchasingLookupService = {
  getSupplierOptions: () => supplierService.getSuppliers({ page_size: 300, ordering: 'supplier_name' }),
  getFuelOptions: () => apiClient.get<PaginatedResponse<FuelOption>>(FUELS_ENDPOINT, { params: { page_size: 300 } }),
  getPartnerOptions: () =>
    apiClient.get<PaginatedResponse<PartnerOption>>(PARTNERS_ENDPOINT, { params: { page_size: 300 } }),
  getCurrencyOptions: () =>
    apiClient.get<PaginatedResponse<CurrencyOption>>(CURRENCIES_ENDPOINT, { params: { page_size: 300 } }),
  getCurrencyRates: () =>
    apiClient.get<PaginatedResponse<CurrencyRateOption>>(CURRENCY_RATES_ENDPOINT, {
      params: { page_size: 500, ordering: '-date,-id' },
    }),
  getTankOptions: () =>
    apiClient.get<PaginatedResponse<TankOption>>(TANKS_ENDPOINT, { params: { page_size: 300 } }),
};

export default {
  suppliers: supplierService,
  purchases: purchaseService,
  orderPurchases: orderPurchaseService,
  lookups: purchasingLookupService,
};
