import { create } from 'zustand';

interface SalaryUiState {
  page: number;
  pageSize: number;
  search: string;
  employee: string;
  year: string;
  month: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<SalaryUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface AccountUiState {
  page: number;
  pageSize: number;
  search: string;
  accountType: string;
  currency: string;
  isActive: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<AccountUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface CurrencyUiState {
  page: number;
  pageSize: number;
  search: string;
  isBase: string;
  isActive: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<CurrencyUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface CurrencyRateUiState {
  page: number;
  pageSize: number;
  search: string;
  fromCurrency: string;
  toCurrency: string;
  dateFrom: string;
  dateTo: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<CurrencyRateUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface ExpenseUiState {
  page: number;
  pageSize: number;
  search: string;
  currency: string;
  payDateFrom: string;
  payDateTo: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<ExpenseUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface PartnerDebtUiState {
  page: number;
  pageSize: number;
  search: string;
  partner: string;
  currency: string;
  dateFrom: string;
  dateTo: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<PartnerDebtUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

interface FinancialTransactionUiState {
  page: number;
  pageSize: number;
  search: string;
  transactionType: string;
  currency: string;
  referenceType: string;
  fromAccount: string;
  toAccount: string;
  dateFrom: string;
  dateTo: string;
  ordering: string;
  setFilters: (filters: Partial<Omit<FinancialTransactionUiState, 'setFilters' | 'resetFilters'>>) => void;
  resetFilters: () => void;
}

const salaryDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  employee: '',
  year: '',
  month: '',
  ordering: '-pay_date',
};

const accountDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  accountType: '',
  currency: '',
  isActive: '',
  ordering: 'name',
};

const currencyDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  isBase: '',
  isActive: '',
  ordering: 'code',
};

const currencyRateDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  fromCurrency: '',
  toCurrency: '',
  dateFrom: '',
  dateTo: '',
  ordering: '-date',
};

const expenseDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  currency: '',
  payDateFrom: '',
  payDateTo: '',
  ordering: '-pay_date',
};

const partnerDebtDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  partner: '',
  currency: '',
  dateFrom: '',
  dateTo: '',
  ordering: '-date',
};

const financialTransactionDefaults = {
  page: 1,
  pageSize: 10,
  search: '',
  transactionType: '',
  currency: '',
  referenceType: '',
  fromAccount: '',
  toAccount: '',
  dateFrom: '',
  dateTo: '',
  ordering: '-date_time',
};

export const useSalaryUiStore = create<SalaryUiState>((set) => ({
  ...salaryDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...salaryDefaults }),
}));

export const useAccountUiStore = create<AccountUiState>((set) => ({
  ...accountDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...accountDefaults }),
}));

export const useCurrencyUiStore = create<CurrencyUiState>((set) => ({
  ...currencyDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...currencyDefaults }),
}));

export const useCurrencyRateUiStore = create<CurrencyRateUiState>((set) => ({
  ...currencyRateDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...currencyRateDefaults }),
}));

export const useExpenseUiStore = create<ExpenseUiState>((set) => ({
  ...expenseDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...expenseDefaults }),
}));

export const usePartnerDebtUiStore = create<PartnerDebtUiState>((set) => ({
  ...partnerDebtDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...partnerDebtDefaults }),
}));

export const useFinancialTransactionUiStore = create<FinancialTransactionUiState>((set) => ({
  ...financialTransactionDefaults,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ ...financialTransactionDefaults }),
}));
