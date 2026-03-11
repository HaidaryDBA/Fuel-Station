import type { InventoryListParams } from '../types/inventory';

// Query Keys for all inventory entities
export const fuelKeys = {
  all: ['fuel'] as const,
  lists: () => [...fuelKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...fuelKeys.lists(), params] as const,
  details: () => [...fuelKeys.all, 'detail'] as const,
  detail: (id: number) => [...fuelKeys.details(), id] as const,
};

export const tankStorageKeys = {
  all: ['tankStorage'] as const,
  lists: () => [...tankStorageKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...tankStorageKeys.lists(), params] as const,
  details: () => [...tankStorageKeys.all, 'detail'] as const,
  detail: (id: number) => [...tankStorageKeys.details(), id] as const,
};

export const fuelMotorKeys = {
  all: ['fuelMotor'] as const,
  lists: () => [...fuelMotorKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...fuelMotorKeys.lists(), params] as const,
  details: () => [...fuelMotorKeys.all, 'detail'] as const,
  detail: (id: number) => [...fuelMotorKeys.details(), id] as const,
};

export const priceHistoryKeys = {
  all: ['priceHistory'] as const,
  lists: () => [...priceHistoryKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...priceHistoryKeys.lists(), params] as const,
  details: () => [...priceHistoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...priceHistoryKeys.details(), id] as const,
};

export const inventoryTransactionKeys = {
  all: ['inventoryTransaction'] as const,
  lists: () => [...inventoryTransactionKeys.all, 'list'] as const,
  list: (params?: InventoryListParams) => [...inventoryTransactionKeys.lists(), params] as const,
  details: () => [...inventoryTransactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventoryTransactionKeys.details(), id] as const,
};
