import type { FinancialTransactionReferenceType } from '../constants/financialTransactionOptions';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EmployeeOption {
  id: number;
  first_name?: string;
  last_name?: string;
  status?: string;
  display_name?: string;
  salary?: string | number;
}

export interface PartnerOption {
  id: number;
  full_name: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_base: boolean;
  is_active: boolean;
}

export interface CurrencyRate {
  id: number;
  from_currency: number;
  from_currency_code: string;
  to_currency: number;
  to_currency_code: string;
  rate_value: string;
  date: string;
  created_by: number;
  created_by_name: string;
}

export type AccountType = 'cash' | 'exchange';

export interface Account {
  id: number;
  name: string;
  account_type: AccountType;
  currency: number;
  currency_code: string;
  is_active: boolean;
  description: string;
}

export interface Salary {
  id: number;
  employee: number;
  employee_name: string;
  year: number;
  month: number;
  base_salary: string;
  bonus: string;
  net_salary: string;
  pay_date: string;
  description: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: string;
  currency_rate: string;
  amount_in_base_currency: string;
  currency: number;
  currency_code: string;
  pay_date: string;
  description: string;
}

export interface PartnerDebt {
  id: number;
  partner: number;
  partner_full_name: string;
  amount_money: string;
  currency_rate: string;
  total_in: string;
  paid_amount: string;
  paid_date: string | null;
  status: string;
  remaining_amount: string;
  created_by: number | null;
  created_by_name: string;
  updated_by: number | null;
  updated_by_name: string;
  currency: number;
  currency_code: string;
  date: string;
  description: string;
  payments?: PartnerDebtPayment[];
  created_at: string;
  updated_at: string;
}

export interface PartnerDebtPayment {
  id: number;
  amount_paid: string;
  currency_paid: number;
  currency_paid_code: string;
  currency_rate: string;
  amount_paid_in_base: string;
  paid_date: string;
  description: string;
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export type FinancialTransactionType = 'deposit' | 'withdraw' | 'transfer';

export interface FinancialTransaction {
  id: number;
  from_account: number | null;
  from_account_name: string;
  to_account: number | null;
  to_account_name: string;
  transaction_type: FinancialTransactionType;
  amount: string;
  currency: number;
  currency_code: string;
  date_time: string;
  reference_type: FinancialTransactionReferenceType | null;
  reference_id: number | null;
  description: string;
  created_by: number;
  created_by_name: string;
  updated_by: number | null;
  updated_by_name: string;
}

export interface SalaryFormValues {
  employee: number;
  year: number;
  month: number;
  base_salary: number;
  bonus: number;
  net_salary: number;
  pay_date: string;
  description: string;
}

export interface AccountFormValues {
  name: string;
  account_type: AccountType;
  currency: number;
  is_active: boolean;
  description: string;
}

export interface CurrencyFormValues {
  name: string;
  code: string;
  symbol: string;
  is_base: boolean;
  is_active: boolean;
}

export interface CurrencyRateFormValues {
  from_currency: number;
  to_currency: number;
  rate_value: number;
  date: string;
}

export interface ExpenseFormValues {
  title: string;
  amount: number;
  currency: number;
  pay_date: string;
  description: string;
}

export interface PartnerDebtFormValues {
  partner: number;
  amount_money: number;
  currency: number;
  date: string;
  payment_amount: number;
  currency_paid: number;
  payment_date: string;
  payment_description: string;
  description: string;
}

export interface FinancialTransactionFormValues {
  from_account: number;
  to_account: number;
  transaction_type: FinancialTransactionType;
  amount: number;
  currency: number;
  date_time: string;
  reference_type: FinancialTransactionReferenceType | '';
  reference_id: number | null;
  description: string;
}

export interface SalaryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  employee?: number;
  year?: number;
  month?: number;
  ordering?: string;
}

export interface AccountListParams {
  page?: number;
  page_size?: number;
  search?: string;
  account_type?: AccountType;
  currency?: number;
  is_active?: boolean;
  ordering?: string;
}

export interface CurrencyListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_base?: boolean;
  is_active?: boolean;
  ordering?: string;
}

export interface EmployeeQueryParams {
  page_size?: number;
  status?: string;
}

export interface CurrencyRateListParams {
  page?: number;
  page_size?: number;
  search?: string;
  from_currency?: number;
  to_currency?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  created_by?: number;
  ordering?: string;
}

export interface ExpenseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  currency?: number;
  pay_date_from?: string;
  pay_date_to?: string;
  ordering?: string;
}

export interface PartnerDebtListParams {
  page?: number;
  page_size?: number;
  search?: string;
  partner?: number;
  currency?: number;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}

export interface FinancialTransactionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  transaction_type?: FinancialTransactionType;
  currency?: number;
  from_account?: number;
  to_account?: number;
  reference_type?: FinancialTransactionReferenceType;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}
