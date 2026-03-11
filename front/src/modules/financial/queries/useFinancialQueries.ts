import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import {
  accountKeys,
  currencyKeys,
  currencyRateKeys,
  expenseKeys,
  financialTransactionKeys,
  financialKeys,
  partnerDebtKeys,
  salaryKeys,
} from './financialKeys';
import financialService from '../services/financialService';
import type {
  AccountFormValues,
  AccountListParams,
  CurrencyFormValues,
  CurrencyListParams,
  CurrencyRateFormValues,
  CurrencyRateListParams,
  EmployeeQueryParams,
  ExpenseFormValues,
  ExpenseListParams,
  FinancialTransactionFormValues,
  FinancialTransactionListParams,
  PartnerDebtFormValues,
  PartnerDebtListParams,
  SalaryFormValues,
  SalaryListParams,
} from '../types/financial';

export const useCurrenciesList = () => {
  const params = { is_active: true, page_size: 300 };

  return useQuery({
    queryKey: financialKeys.currencies(params),
    queryFn: () => financialService.getCurrencies(params).then((res) => res.data),
  });
};

export const useCurrencies = (params?: CurrencyListParams) => {
  return useQuery({
    queryKey: currencyKeys.list(params),
    queryFn: () => financialService.getCurrencies(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useCurrencyDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: currencyKeys.detail(id),
    queryFn: () => financialService.getCurrency(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CurrencyFormValues) => financialService.createCurrency(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Currency created successfully');
      queryClient.invalidateQueries({ queryKey: currencyKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create currency'));
    },
  });
};

export const useUpdateCurrency = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CurrencyFormValues) => financialService.updateCurrency(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Currency updated successfully');
      queryClient.invalidateQueries({ queryKey: currencyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: currencyKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update currency'));
    },
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteCurrency(id),
    onSuccess: () => {
      toast.success('Currency deleted successfully');
      queryClient.invalidateQueries({ queryKey: currencyKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete currency'));
    },
  });
};

export const useCurrencyRatesList = (params?: CurrencyRateListParams) => {
  return useQuery({
    queryKey: currencyRateKeys.list(params),
    queryFn: () => financialService.getCurrencyRates(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useCurrencyRateDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: currencyRateKeys.detail(id),
    queryFn: () => financialService.getCurrencyRate(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateCurrencyRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CurrencyRateFormValues) =>
      financialService.createCurrencyRate(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Currency rate created successfully');
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create currency rate'));
    },
  });
};

export const useUpdateCurrencyRate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CurrencyRateFormValues) =>
      financialService.updateCurrencyRate(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Currency rate updated successfully');
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update currency rate'));
    },
  });
};

export const useDeleteCurrencyRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteCurrencyRate(id),
    onSuccess: () => {
      toast.success('Currency rate deleted successfully');
      queryClient.invalidateQueries({ queryKey: currencyRateKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete currency rate'));
    },
  });
};

export const useAccountsList = (params?: AccountListParams) => {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => financialService.getAccounts(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useAccountDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => financialService.getAccount(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountFormValues) => financialService.createAccount(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Account created successfully');
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create account'));
    },
  });
};

export const useUpdateAccount = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AccountFormValues) => financialService.updateAccount(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Account updated successfully');
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update account'));
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteAccount(id),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete account'));
    },
  });
};

export const useEmployeeOptions = (params?: EmployeeQueryParams) => {
  return useQuery({
    queryKey: financialKeys.employees(params),
    queryFn: () => financialService.getEmployees({ page_size: 300, ...params }).then((res) => res.data),
  });
};

export const usePartnerOptions = () => {
  return useQuery({
    queryKey: financialKeys.partners,
    queryFn: () => financialService.getPartners({ page_size: 300 }).then((res) => res.data),
  });
};

export const useSalariesList = (params?: SalaryListParams) => {
  return useQuery({
    queryKey: salaryKeys.list(params),
    queryFn: () => financialService.getSalaries(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useSalaryDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: salaryKeys.detail(id),
    queryFn: () => financialService.getSalary(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalaryFormValues) => financialService.createSalary(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Salary created successfully');
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create salary'));
    },
  });
};

export const useUpdateSalary = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalaryFormValues) => financialService.updateSalary(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Salary updated successfully');
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update salary'));
    },
  });
};

export const useDeleteSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteSalary(id),
    onSuccess: () => {
      toast.success('Salary deleted successfully');
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete salary'));
    },
  });
};

export const useExpensesList = (params?: ExpenseListParams) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => financialService.getExpenses(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useExpenseDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => financialService.getExpense(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseFormValues) => financialService.createExpense(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Expense created successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create expense'));
    },
  });
};

export const useUpdateExpense = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseFormValues) => financialService.updateExpense(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Expense updated successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update expense'));
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteExpense(id),
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete expense'));
    },
  });
};

export const usePartnerDebtsList = (params?: PartnerDebtListParams) => {
  return useQuery({
    queryKey: partnerDebtKeys.list(params),
    queryFn: () => financialService.getPartnerDebts(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const usePartnerDebtDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: partnerDebtKeys.detail(id),
    queryFn: () => financialService.getPartnerDebt(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreatePartnerDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerDebtFormValues) =>
      financialService.createPartnerDebt(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Partner debt created successfully');
      queryClient.invalidateQueries({ queryKey: partnerDebtKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create partner debt'));
    },
  });
};

export const useUpdatePartnerDebt = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerDebtFormValues) =>
      financialService.updatePartnerDebt(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Partner debt updated successfully');
      queryClient.invalidateQueries({ queryKey: partnerDebtKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerDebtKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update partner debt'));
    },
  });
};

export const useDeletePartnerDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deletePartnerDebt(id),
    onSuccess: () => {
      toast.success('Partner debt deleted successfully');
      queryClient.invalidateQueries({ queryKey: partnerDebtKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete partner debt'));
    },
  });
};

export const useFinancialTransactionsList = (params?: FinancialTransactionListParams) => {
  return useQuery({
    queryKey: financialTransactionKeys.list(params),
    queryFn: () => financialService.getFinancialTransactions(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useFinancialTransactionDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: financialTransactionKeys.detail(id),
    queryFn: () => financialService.getFinancialTransaction(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FinancialTransactionFormValues) =>
      financialService.createFinancialTransaction(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Financial transaction created successfully');
      queryClient.invalidateQueries({ queryKey: financialTransactionKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create financial transaction'));
    },
  });
};

export const useUpdateFinancialTransaction = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FinancialTransactionFormValues) =>
      financialService.updateFinancialTransaction(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Financial transaction updated successfully');
      queryClient.invalidateQueries({ queryKey: financialTransactionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: financialTransactionKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update financial transaction'));
    },
  });
};

export const useDeleteFinancialTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => financialService.deleteFinancialTransaction(id),
    onSuccess: () => {
      toast.success('Financial transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: financialTransactionKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete financial transaction'));
    },
  });
};
