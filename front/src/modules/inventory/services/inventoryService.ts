import apiClient from '@/lib/api';

import type {
  Fuel,
  FuelFormValues,
  TankStorage,
  TankStorageFormValues,
  FuelMotor,
  FuelMotorFormValues,
  PriceHistory,
  PriceHistoryFormValues,
  InventoryTransaction,
  InventoryTransactionFormValues,
  InventoryListParams,
  PaginatedInventoryResponse,
} from '../types/inventory';

// API Endpoints - Assuming they follow the Django REST Framework pattern
const FUEL_ENDPOINT = '/inventory/fuel/';
const TANK_STORAGE_ENDPOINT = '/inventory/tank-storage/';
const FUEL_MOTOR_ENDPOINT = '/inventory/fuel-motor/';
const PRICE_HISTORY_ENDPOINT = '/inventory/price-history/';
const INVENTORY_TRANSACTION_ENDPOINT = '/inventory/transaction/';

const normalizePriceHistoryPayload = (payload: PriceHistoryFormValues) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() ? payload.end_date : null,
});

// Fuel Service
export const fuelService = {
  getFuels: (params?: InventoryListParams) =>
    apiClient.get<PaginatedInventoryResponse<Fuel>>(FUEL_ENDPOINT, { params }),

  getFuel: (id: number) => apiClient.get<Fuel>(`${FUEL_ENDPOINT}${id}/`),

  createFuel: (payload: FuelFormValues) =>
    apiClient.post<Fuel>(FUEL_ENDPOINT, payload),

  updateFuel: (id: number, payload: FuelFormValues) =>
    apiClient.patch<Fuel>(`${FUEL_ENDPOINT}${id}/`, payload),

  deleteFuel: (id: number) => apiClient.delete(`${FUEL_ENDPOINT}${id}/`),
};

// Tank Storage Service
export const tankStorageService = {
  getTankStorages: (params?: InventoryListParams) =>
    apiClient.get<PaginatedInventoryResponse<TankStorage>>(TANK_STORAGE_ENDPOINT, { params }),

  getTankStorage: (id: number) => apiClient.get<TankStorage>(`${TANK_STORAGE_ENDPOINT}${id}/`),

  createTankStorage: (payload: TankStorageFormValues) =>
    apiClient.post<TankStorage>(TANK_STORAGE_ENDPOINT, payload),

  updateTankStorage: (id: number, payload: TankStorageFormValues) =>
    apiClient.patch<TankStorage>(`${TANK_STORAGE_ENDPOINT}${id}/`, payload),

  deleteTankStorage: (id: number) => apiClient.delete(`${TANK_STORAGE_ENDPOINT}${id}/`),
};

// Fuel Motor Service
export const fuelMotorService = {
  getFuelMotors: (params?: InventoryListParams) =>
    apiClient.get<PaginatedInventoryResponse<FuelMotor>>(FUEL_MOTOR_ENDPOINT, { params }),

  getFuelMotor: (id: number) => apiClient.get<FuelMotor>(`${FUEL_MOTOR_ENDPOINT}${id}/`),

  createFuelMotor: (payload: FuelMotorFormValues) =>
    apiClient.post<FuelMotor>(FUEL_MOTOR_ENDPOINT, payload),

  updateFuelMotor: (id: number, payload: FuelMotorFormValues) =>
    apiClient.patch<FuelMotor>(`${FUEL_MOTOR_ENDPOINT}${id}/`, payload),

  deleteFuelMotor: (id: number) => apiClient.delete(`${FUEL_MOTOR_ENDPOINT}${id}/`),
};

// Price History Service
export const priceHistoryService = {
  getPriceHistories: (params?: InventoryListParams) =>
    apiClient.get<PaginatedInventoryResponse<PriceHistory>>(PRICE_HISTORY_ENDPOINT, { params }),

  getPriceHistory: (id: number) => apiClient.get<PriceHistory>(`${PRICE_HISTORY_ENDPOINT}${id}/`),

  createPriceHistory: (payload: PriceHistoryFormValues) =>
    apiClient.post<PriceHistory>(PRICE_HISTORY_ENDPOINT, normalizePriceHistoryPayload(payload)),

  updatePriceHistory: (id: number, payload: PriceHistoryFormValues) =>
    apiClient.patch<PriceHistory>(`${PRICE_HISTORY_ENDPOINT}${id}/`, normalizePriceHistoryPayload(payload)),

  deletePriceHistory: (id: number) => apiClient.delete(`${PRICE_HISTORY_ENDPOINT}${id}/`),
};

// Inventory Transaction Service
export const inventoryTransactionService = {
  getTransactions: (params?: InventoryListParams) =>
    apiClient.get<PaginatedInventoryResponse<InventoryTransaction>>(INVENTORY_TRANSACTION_ENDPOINT, { params }),

  getTransaction: (id: number) => apiClient.get<InventoryTransaction>(`${INVENTORY_TRANSACTION_ENDPOINT}${id}/`),

  createTransaction: (payload: InventoryTransactionFormValues) =>
    apiClient.post<InventoryTransaction>(INVENTORY_TRANSACTION_ENDPOINT, payload),

  updateTransaction: (id: number, payload: InventoryTransactionFormValues) =>
    apiClient.patch<InventoryTransaction>(`${INVENTORY_TRANSACTION_ENDPOINT}${id}/`, payload),

  deleteTransaction: (id: number) => apiClient.delete(`${INVENTORY_TRANSACTION_ENDPOINT}${id}/`),
};

export default {
  fuel: fuelService,
  tankStorage: tankStorageService,
  fuelMotor: fuelMotorService,
  priceHistory: priceHistoryService,
  transaction: inventoryTransactionService,
};
