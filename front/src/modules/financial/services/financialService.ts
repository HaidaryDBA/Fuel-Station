import apiClient from '@/lib/api';

import type {
  Account,
  AccountFormValues,
  AccountListParams,
  Currency,
  CurrencyFormValues,
  CurrencyListParams,
  CurrencyRate,
  CurrencyRateFormValues,
  CurrencyRateListParams,
  EmployeeQueryParams,
  EmployeeOption,
  Expense,
  ExpenseFormValues,
  ExpenseListParams,
  FinancialTransaction,
  FinancialTransactionFormValues,
  FinancialTransactionListParams,
  PaginatedResponse,
  PartnerDebt,
  PartnerDebtFormValues,
  PartnerDebtListParams,
  PartnerOption,
  Salary,
  SalaryFormValues,
  SalaryListParams,
} from '../types/financial';

const CURRENCIES_ENDPOINT = '/financial/currencies/';
const CURRENCY_RATES_ENDPOINT = '/financial/currency-rates/';
const ACCOUNTS_ENDPOINT = '/financial/accounts/';
const SALARIES_ENDPOINT = '/financial/salaries/';
const EXPENSES_ENDPOINT = '/financial/expenses/';
const PARTNER_DEBTS_ENDPOINT = '/financial/partner-debts/';
const TRANSACTIONS_ENDPOINT = '/financial/transactions/';
const EMPLOYEES_ENDPOINT = '/employees/';
const PARTNERS_ENDPOINT = '/employees/partners/';

const normalizeTransactionPayload = (payload: FinancialTransactionFormValues) => ({
  ...payload,
  from_account: payload.from_account || null,
  to_account: payload.to_account || null,
  reference_type: payload.reference_type.trim() || null,
  reference_id: payload.reference_id || null,
});

const normalizePartnerDebtPayload = (payload: PartnerDebtFormValues) => ({
  ...payload,
  payment_amount: payload.payment_amount > 0 ? payload.payment_amount : null,
  currency_paid: payload.payment_amount > 0 ? payload.currency_paid || null : null,
  payment_date: payload.payment_amount > 0 && payload.payment_date.trim() ? payload.payment_date : null,
  payment_description: payload.payment_description.trim(),
});

export const financialService = {
  getCurrencies: (params?: CurrencyListParams) =>
    apiClient.get<PaginatedResponse<Currency>>(CURRENCIES_ENDPOINT, { params }),

  getCurrency: (id: number) => apiClient.get<Currency>(`${CURRENCIES_ENDPOINT}${id}/`),

  createCurrency: (payload: CurrencyFormValues) => apiClient.post<Currency>(CURRENCIES_ENDPOINT, payload),

  updateCurrency: (id: number, payload: CurrencyFormValues) =>
    apiClient.patch<Currency>(`${CURRENCIES_ENDPOINT}${id}/`, payload),

  deleteCurrency: (id: number) => apiClient.delete(`${CURRENCIES_ENDPOINT}${id}/`),

  getCurrencyRates: (params?: CurrencyRateListParams) =>
    apiClient.get<PaginatedResponse<CurrencyRate>>(CURRENCY_RATES_ENDPOINT, { params }),

  getCurrencyRate: (id: number) => apiClient.get<CurrencyRate>(`${CURRENCY_RATES_ENDPOINT}${id}/`),

  createCurrencyRate: (payload: CurrencyRateFormValues) =>
    apiClient.post<CurrencyRate>(CURRENCY_RATES_ENDPOINT, payload),

  updateCurrencyRate: (id: number, payload: CurrencyRateFormValues) =>
    apiClient.patch<CurrencyRate>(`${CURRENCY_RATES_ENDPOINT}${id}/`, payload),

  deleteCurrencyRate: (id: number) => apiClient.delete(`${CURRENCY_RATES_ENDPOINT}${id}/`),

  getAccounts: (params?: AccountListParams) =>
    apiClient.get<PaginatedResponse<Account>>(ACCOUNTS_ENDPOINT, { params }),

  getAccount: (id: number) => apiClient.get<Account>(`${ACCOUNTS_ENDPOINT}${id}/`),

  createAccount: (payload: AccountFormValues) => apiClient.post<Account>(ACCOUNTS_ENDPOINT, payload),

  updateAccount: (id: number, payload: AccountFormValues) =>
    apiClient.patch<Account>(`${ACCOUNTS_ENDPOINT}${id}/`, payload),

  deleteAccount: (id: number) => apiClient.delete(`${ACCOUNTS_ENDPOINT}${id}/`),

  getSalaries: (params?: SalaryListParams) =>
    apiClient.get<PaginatedResponse<Salary>>(SALARIES_ENDPOINT, { params }),

  getSalary: (id: number) => apiClient.get<Salary>(`${SALARIES_ENDPOINT}${id}/`),

  createSalary: (payload: SalaryFormValues) => apiClient.post<Salary>(SALARIES_ENDPOINT, payload),

  updateSalary: (id: number, payload: SalaryFormValues) =>
    apiClient.patch<Salary>(`${SALARIES_ENDPOINT}${id}/`, payload),

  deleteSalary: (id: number) => apiClient.delete(`${SALARIES_ENDPOINT}${id}/`),

  getExpenses: (params?: ExpenseListParams) =>
    apiClient.get<PaginatedResponse<Expense>>(EXPENSES_ENDPOINT, { params }),

  getExpense: (id: number) => apiClient.get<Expense>(`${EXPENSES_ENDPOINT}${id}/`),

  createExpense: (payload: ExpenseFormValues) => apiClient.post<Expense>(EXPENSES_ENDPOINT, payload),

  updateExpense: (id: number, payload: ExpenseFormValues) =>
    apiClient.patch<Expense>(`${EXPENSES_ENDPOINT}${id}/`, payload),

  deleteExpense: (id: number) => apiClient.delete(`${EXPENSES_ENDPOINT}${id}/`),

  getPartnerDebts: (params?: PartnerDebtListParams) =>
    apiClient.get<PaginatedResponse<PartnerDebt>>(PARTNER_DEBTS_ENDPOINT, { params }),

  getPartnerDebt: (id: number) => apiClient.get<PartnerDebt>(`${PARTNER_DEBTS_ENDPOINT}${id}/`),

  createPartnerDebt: (payload: PartnerDebtFormValues) =>
    apiClient.post<PartnerDebt>(PARTNER_DEBTS_ENDPOINT, normalizePartnerDebtPayload(payload)),

  updatePartnerDebt: (id: number, payload: PartnerDebtFormValues) =>
    apiClient.patch<PartnerDebt>(`${PARTNER_DEBTS_ENDPOINT}${id}/`, normalizePartnerDebtPayload(payload)),

  deletePartnerDebt: (id: number) => apiClient.delete(`${PARTNER_DEBTS_ENDPOINT}${id}/`),

  getFinancialTransactions: (params?: FinancialTransactionListParams) =>
    apiClient.get<PaginatedResponse<FinancialTransaction>>(TRANSACTIONS_ENDPOINT, { params }),

  getFinancialTransaction: (id: number) =>
    apiClient.get<FinancialTransaction>(`${TRANSACTIONS_ENDPOINT}${id}/`),

  createFinancialTransaction: (payload: FinancialTransactionFormValues) =>
    apiClient.post<FinancialTransaction>(TRANSACTIONS_ENDPOINT, normalizeTransactionPayload(payload)),

  updateFinancialTransaction: (id: number, payload: FinancialTransactionFormValues) =>
    apiClient.patch<FinancialTransaction>(
      `${TRANSACTIONS_ENDPOINT}${id}/`,
      normalizeTransactionPayload(payload)
    ),

  deleteFinancialTransaction: (id: number) => apiClient.delete(`${TRANSACTIONS_ENDPOINT}${id}/`),

  getEmployees: (params?: EmployeeQueryParams) =>
    apiClient.get<PaginatedResponse<EmployeeOption>>(EMPLOYEES_ENDPOINT, { params }),

  getPartners: (params?: { page_size?: number }) =>
    apiClient.get<PaginatedResponse<PartnerOption>>(PARTNERS_ENDPOINT, { params }),
};

export default financialService;
