import { create } from 'zustand';

interface BookUiState {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  publisher: string;
  rentable: '' | 'true' | 'false';
  inStock: '' | 'true' | 'false';
  ordering: string;
  selectedBookId: number | null;
  setFilters: (
    filters: Partial<Omit<BookUiState, 'setFilters' | 'resetFilters' | 'setSelectedBookId'>>
  ) => void;
  setSelectedBookId: (id: number | null) => void;
  resetFilters: () => void;
}

const defaultState = {
  page: 1,
  pageSize: 10,
  search: '',
  category: '',
  publisher: '',
  rentable: '' as const,
  inStock: '' as const,
  ordering: '-created_at',
};

export const useBookUiStore = create<BookUiState>((set) => ({
  ...defaultState,
  selectedBookId: null,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  setSelectedBookId: (id) => set({ selectedBookId: id }),
  resetFilters: () => set({ ...defaultState }),
}));

