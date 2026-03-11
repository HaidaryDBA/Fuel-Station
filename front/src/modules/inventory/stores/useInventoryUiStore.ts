import { create } from 'zustand';

import type { TransactionType } from '../types/inventory';

// Base interface for inventory filters
interface InventoryUiState {
  page: number;
  pageSize: number;
  search: string;
  ordering: string;
  selectedItemId: number | null;
  setFilters: (
    filters: Partial<Omit<InventoryUiState, 'setFilters' | 'resetFilters' | 'setSelectedItemId'>>
  ) => void;
  setSelectedItemId: (id: number | null) => void;
  resetFilters: () => void;
}

const defaultState = {
  page: 1,
  pageSize: 10,
  search: '',
  ordering: '-id',
};

// Fuel Store
interface FuelUiState extends InventoryUiState {}

export const useFuelUiStore = create<FuelUiState>((set) => ({
  ...defaultState,
  selectedItemId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

// Tank Storage Store
interface TankStorageUiState extends InventoryUiState {}

export const useTankStorageUiStore = create<TankStorageUiState>((set) => ({
  ...defaultState,
  selectedItemId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

// Fuel Motor Store
interface FuelMotorUiState extends InventoryUiState {}

export const useFuelMotorUiStore = create<FuelMotorUiState>((set) => ({
  ...defaultState,
  selectedItemId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

// Price History Store
interface PriceHistoryUiState extends InventoryUiState {}

export const usePriceHistoryUiStore = create<PriceHistoryUiState>((set) => ({
  ...defaultState,
  selectedItemId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

// Inventory Transaction Store
interface InventoryTransactionUiState extends InventoryUiState {
  transactionType: TransactionType | '';
  tankId: number | null;
  fuelId: number | null;
  dateFrom: string;
  dateTo: string;
  setTransactionFilters: (
    filters: Partial<Omit<InventoryTransactionUiState, 'setFilters' | 'resetFilters' | 'setSelectedItemId' | 'setTransactionFilters'>>
  ) => void;
}

export const useInventoryTransactionUiStore = create<InventoryTransactionUiState>((set) => ({
  ...defaultState,
  ordering: '-date_time',
  selectedItemId: null,
  transactionType: '',
  tankId: null,
  fuelId: null,
  dateFrom: '',
  dateTo: '',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setTransactionFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () =>
    set({
      ...defaultState,
      ordering: '-date_time',
      transactionType: '',
      tankId: null,
      fuelId: null,
      dateFrom: '',
      dateTo: '',
    }),
}));
