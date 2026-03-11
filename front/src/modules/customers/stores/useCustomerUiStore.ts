import { create } from 'zustand';

interface CustomerUiState {
  page: number;
  pageSize: number;
  search: string;
  isActive: '' | 'true' | 'false';
  ordering: string;
  selectedCustomerId: number | null;
  setFilters: (
    filters: Partial<Omit<CustomerUiState, 'setFilters' | 'resetFilters' | 'setSelectedCustomerId'>>
  ) => void;
  setSelectedCustomerId: (id: number | null) => void;
  resetFilters: () => void;
}

const defaultState = {
  page: 1,
  pageSize: 10,
  search: '',
  isActive: '' as const,
  ordering: '-created_at',
};

export const useCustomerUiStore = create<CustomerUiState>((set) => ({
  ...defaultState,
  selectedCustomerId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

