import { create } from 'zustand';

interface PartnerUiState {
  page: number;
  pageSize: number;
  search: string;
  joinDateFrom: string;
  joinDateTo: string;
  minShare: string;
  maxShare: string;
  ordering: string;
  selectedPartnerId: number | null;
  setFilters: (
    filters: Partial<Omit<PartnerUiState, 'setFilters' | 'resetFilters' | 'setSelectedPartnerId'>>
  ) => void;
  setSelectedPartnerId: (id: number | null) => void;
  resetFilters: () => void;
}

const defaultState = {
  page: 1,
  pageSize: 10,
  search: '',
  joinDateFrom: '',
  joinDateTo: '',
  minShare: '',
  maxShare: '',
  ordering: '-id',
};

export const usePartnerUiStore = create<PartnerUiState>((set) => ({
  ...defaultState,
  selectedPartnerId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedPartnerId: (id) => set({ selectedPartnerId: id }),
  resetFilters: () => set({ ...defaultState }),
}));
