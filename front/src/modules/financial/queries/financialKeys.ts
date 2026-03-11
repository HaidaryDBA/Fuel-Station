import type {
  AccountListParams,
  CurrencyListParams,
  CurrencyRateListParams,
  EmployeeQueryParams,
  ExpenseListParams,
  FinancialTransactionListParams,
  PartnerDebtListParams,
  SalaryListParams,
} from '../types/financial';

export const financialKeys = {
  currencies: (params?: CurrencyListParams) => ['financial', 'currencies', params] as const,
  currencyRates: (params?: CurrencyRateListParams) => ['financial', 'currencyRates', params] as const,
  employees: (params?: EmployeeQueryParams) => ['financial', 'employees', params] as const,
  partners: ['financial', 'partners'] as const,
  transactions: (params?: FinancialTransactionListParams) => ['financial', 'transactions', params] as const,
};

export const currencyKeys = {
  all: ['financial', 'currencies'] as const,
  lists: () => [...currencyKeys.all, 'list'] as const,
  list: (params?: CurrencyListParams) => [...currencyKeys.lists(), params] as const,
  details: () => [...currencyKeys.all, 'detail'] as const,
  detail: (id: number) => [...currencyKeys.details(), id] as const,
};

export const currencyRateKeys = {
  all: ['financial', 'currencyRates'] as const,
  lists: () => [...currencyRateKeys.all, 'list'] as const,
  list: (params?: CurrencyRateListParams) => [...currencyRateKeys.lists(), params] as const,
  details: () => [...currencyRateKeys.all, 'detail'] as const,
  detail: (id: number) => [...currencyRateKeys.details(), id] as const,
};

export const accountKeys = {
  all: ['financial', 'accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: AccountListParams) => [...accountKeys.lists(), params] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
};

export const salaryKeys = {
  all: ['financial', 'salaries'] as const,
  lists: () => [...salaryKeys.all, 'list'] as const,
  list: (params?: SalaryListParams) => [...salaryKeys.lists(), params] as const,
  details: () => [...salaryKeys.all, 'detail'] as const,
  detail: (id: number) => [...salaryKeys.details(), id] as const,
};

export const expenseKeys = {
  all: ['financial', 'expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params?: ExpenseListParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
};

export const partnerDebtKeys = {
  all: ['financial', 'partnerDebts'] as const,
  lists: () => [...partnerDebtKeys.all, 'list'] as const,
  list: (params?: PartnerDebtListParams) => [...partnerDebtKeys.lists(), params] as const,
  details: () => [...partnerDebtKeys.all, 'detail'] as const,
  detail: (id: number) => [...partnerDebtKeys.details(), id] as const,
};

export const financialTransactionKeys = {
  all: ['financial', 'transactions'] as const,
  lists: () => [...financialTransactionKeys.all, 'list'] as const,
  list: (params?: FinancialTransactionListParams) => [...financialTransactionKeys.lists(), params] as const,
  details: () => [...financialTransactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...financialTransactionKeys.details(), id] as const,
};
