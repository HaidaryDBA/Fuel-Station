import type { OrderPurchaseListParams, PurchaseListParams, SupplierListParams } from '../types/purchasing';

export const supplierKeys = {
  all: ['purchasing', 'suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params?: SupplierListParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
};

export const purchaseKeys = {
  all: ['purchasing', 'purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (params?: PurchaseListParams) => [...purchaseKeys.lists(), params] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: number) => [...purchaseKeys.details(), id] as const,
};

export const orderPurchaseKeys = {
  all: ['purchasing', 'orderPurchases'] as const,
  lists: () => [...orderPurchaseKeys.all, 'list'] as const,
  list: (params?: OrderPurchaseListParams) => [...orderPurchaseKeys.lists(), params] as const,
  details: () => [...orderPurchaseKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderPurchaseKeys.details(), id] as const,
};

export const purchasingLookupKeys = {
  suppliers: ['purchasing', 'lookup', 'suppliers'] as const,
  fuels: ['purchasing', 'lookup', 'fuels'] as const,
  partners: ['purchasing', 'lookup', 'partners'] as const,
  currencies: ['purchasing', 'lookup', 'currencies'] as const,
  currencyRates: ['purchasing', 'lookup', 'currency-rates'] as const,
  tanks: ['purchasing', 'lookup', 'tanks'] as const,
};
