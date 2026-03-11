import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type {
  AccountListParams,
  CurrencyListParams,
  CurrencyRateListParams,
  ExpenseListParams,
  FinancialTransactionListParams,
  PartnerDebtListParams,
  SalaryListParams,
} from '../types/financial';
import {
  useAccountUiStore,
  useFinancialTransactionUiStore,
  useCurrencyRateUiStore,
  useCurrencyUiStore,
  useExpenseUiStore,
  usePartnerDebtUiStore,
  useSalaryUiStore,
} from '../stores/useFinancialUiStore';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const useAccountFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, accountType, currency, isActive, ordering, setFilters, resetFilters } =
    useAccountUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      accountType: searchParams.get('account_type') || '',
      currency: searchParams.get('currency') || '',
      isActive: searchParams.get('is_active') || '',
      ordering: searchParams.get('ordering') || 'name',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (accountType) params.set('account_type', accountType);
    if (currency) params.set('currency', currency);
    if (isActive) params.set('is_active', isActive);
    if (ordering && ordering !== 'name') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, accountType, currency, isActive, ordering, setSearchParams]);

  const params = useMemo<AccountListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      account_type: accountType ? (accountType as AccountListParams['account_type']) : undefined,
      currency: currency ? Number(currency) : undefined,
      is_active: parseBoolean(isActive),
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, accountType, currency, isActive, ordering]);

  const updateFilter = (
    key: 'search' | 'accountType' | 'currency' | 'isActive' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, accountType, currency, isActive, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const useCurrencyFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, isBase, isActive, ordering, setFilters, resetFilters } = useCurrencyUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      isBase: searchParams.get('is_base') || '',
      isActive: searchParams.get('is_active') || '',
      ordering: searchParams.get('ordering') || 'code',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (isBase) params.set('is_base', isBase);
    if (isActive) params.set('is_active', isActive);
    if (ordering && ordering !== 'code') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, isBase, isActive, ordering, setSearchParams]);

  const params = useMemo<CurrencyListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      is_base: parseBoolean(isBase),
      is_active: parseBoolean(isActive),
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, isBase, isActive, ordering]);

  const updateFilter = (
    key: 'search' | 'isBase' | 'isActive' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, isBase, isActive, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const useCurrencyRateFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, fromCurrency, toCurrency, dateFrom, dateTo, ordering, setFilters, resetFilters } =
    useCurrencyRateUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      fromCurrency: searchParams.get('from_currency') || '',
      toCurrency: searchParams.get('to_currency') || '',
      dateFrom: searchParams.get('date_from') || '',
      dateTo: searchParams.get('date_to') || '',
      ordering: searchParams.get('ordering') || '-date',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (fromCurrency) params.set('from_currency', fromCurrency);
    if (toCurrency) params.set('to_currency', toCurrency);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (ordering && ordering !== '-date') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, fromCurrency, toCurrency, dateFrom, dateTo, ordering, setSearchParams]);

  const params = useMemo<CurrencyRateListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      from_currency: fromCurrency ? Number(fromCurrency) : undefined,
      to_currency: toCurrency ? Number(toCurrency) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, fromCurrency, toCurrency, dateFrom, dateTo, ordering]);

  const updateFilter = (
    key: 'search' | 'fromCurrency' | 'toCurrency' | 'dateFrom' | 'dateTo' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, fromCurrency, toCurrency, dateFrom, dateTo, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const useSalaryFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, employee, year, month, ordering, setFilters, resetFilters } =
    useSalaryUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      employee: searchParams.get('employee') || '',
      year: searchParams.get('year') || '',
      month: searchParams.get('month') || '',
      ordering: searchParams.get('ordering') || '-pay_date',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (employee) params.set('employee', employee);
    if (year) params.set('year', year);
    if (month) params.set('month', month);
    if (ordering && ordering !== '-pay_date') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, employee, year, month, ordering, setSearchParams]);

  const params = useMemo<SalaryListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      employee: employee ? Number(employee) : undefined,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, employee, year, month, ordering]);

  const updateFilter = (
    key: 'search' | 'employee' | 'year' | 'month' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, employee, year, month, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const useExpenseFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, currency, payDateFrom, payDateTo, ordering, setFilters, resetFilters } =
    useExpenseUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      currency: searchParams.get('currency') || '',
      payDateFrom: searchParams.get('pay_date_from') || '',
      payDateTo: searchParams.get('pay_date_to') || '',
      ordering: searchParams.get('ordering') || '-pay_date',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (currency) params.set('currency', currency);
    if (payDateFrom) params.set('pay_date_from', payDateFrom);
    if (payDateTo) params.set('pay_date_to', payDateTo);
    if (ordering && ordering !== '-pay_date') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, currency, payDateFrom, payDateTo, ordering, setSearchParams]);

  const params = useMemo<ExpenseListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      currency: currency ? Number(currency) : undefined,
      pay_date_from: payDateFrom || undefined,
      pay_date_to: payDateTo || undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, currency, payDateFrom, payDateTo, ordering]);

  const updateFilter = (
    key: 'search' | 'currency' | 'payDateFrom' | 'payDateTo' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, currency, payDateFrom, payDateTo, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const usePartnerDebtFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const { page, pageSize, search, partner, currency, dateFrom, dateTo, ordering, setFilters, resetFilters } =
    usePartnerDebtUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      partner: searchParams.get('partner') || '',
      currency: searchParams.get('currency') || '',
      dateFrom: searchParams.get('date_from') || '',
      dateTo: searchParams.get('date_to') || '',
      ordering: searchParams.get('ordering') || '-date',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (partner) params.set('partner', partner);
    if (currency) params.set('currency', currency);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (ordering && ordering !== '-date') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, partner, currency, dateFrom, dateTo, ordering, setSearchParams]);

  const params = useMemo<PartnerDebtListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      partner: partner ? Number(partner) : undefined,
      currency: currency ? Number(currency) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, partner, currency, dateFrom, dateTo, ordering]);

  const updateFilter = (
    key: 'search' | 'partner' | 'currency' | 'dateFrom' | 'dateTo' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: { page, pageSize, search, partner, currency, dateFrom, dateTo, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};

export const useFinancialTransactionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const {
    page,
    pageSize,
    search,
    transactionType,
    currency,
    referenceType,
    fromAccount,
    toAccount,
    dateFrom,
    dateTo,
    ordering,
    setFilters,
    resetFilters,
  } = useFinancialTransactionUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      transactionType: searchParams.get('transaction_type') || '',
      currency: searchParams.get('currency') || '',
      referenceType: searchParams.get('reference_type') || '',
      fromAccount: searchParams.get('from_account') || '',
      toAccount: searchParams.get('to_account') || '',
      dateFrom: searchParams.get('date_from') || '',
      dateTo: searchParams.get('date_to') || '',
      ordering: searchParams.get('ordering') || '-date_time',
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (transactionType) params.set('transaction_type', transactionType);
    if (currency) params.set('currency', currency);
    if (referenceType) params.set('reference_type', referenceType);
    if (fromAccount) params.set('from_account', fromAccount);
    if (toAccount) params.set('to_account', toAccount);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (ordering && ordering !== '-date_time') params.set('ordering', ordering);

    setSearchParams(params, { replace: true });
  }, [
    page,
    pageSize,
    search,
    transactionType,
    currency,
    referenceType,
    fromAccount,
    toAccount,
    dateFrom,
    dateTo,
    ordering,
    setSearchParams,
  ]);

  const params = useMemo<FinancialTransactionListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      transaction_type: transactionType
        ? (transactionType as FinancialTransactionListParams['transaction_type'])
        : undefined,
      currency: currency ? Number(currency) : undefined,
      reference_type: referenceType
        ? (referenceType as FinancialTransactionListParams['reference_type'])
        : undefined,
      from_account: fromAccount ? Number(fromAccount) : undefined,
      to_account: toAccount ? Number(toAccount) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      ordering: ordering || undefined,
    };
  }, [
    page,
    pageSize,
    search,
    transactionType,
    currency,
    referenceType,
    fromAccount,
    toAccount,
    dateFrom,
    dateTo,
    ordering,
  ]);

  const updateFilter = (
    key:
      | 'search'
      | 'transactionType'
      | 'currency'
      | 'referenceType'
      | 'fromAccount'
      | 'toAccount'
      | 'dateFrom'
      | 'dateTo'
      | 'ordering'
      | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: 1,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });

  return {
    filters: {
      page,
      pageSize,
      search,
      transactionType,
      currency,
      referenceType,
      fromAccount,
      toAccount,
      dateFrom,
      dateTo,
      ordering,
    },
    params,
    updateFilter,
    setPage,
    clearFilters: resetFilters,
  };
};
