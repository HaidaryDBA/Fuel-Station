import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { LendingListParams, LendingStatus, SaleListParams } from '../types/sale';

const parseNumber = (value: string | null, fallback = 0) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePositiveNumber = (value: string | null) => {
  const parsed = parseNumber(value, 0);
  return parsed > 0 ? parsed : undefined;
};

const parseStatus = (value: string | null): LendingStatus | undefined => {
  if (value === 'unpaid' || value === 'partial' || value === 'paid' || value === 'overdue') {
    return value;
  }
  return undefined;
};

const useBaseFilters = (defaultOrdering: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseNumber(searchParams.get('page'), 1) || 1;
  const pageSize = parseNumber(searchParams.get('page_size'), 10) || 10;
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || defaultOrdering;

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 0) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace: true });
  };

  const updateBaseFilter = (key: 'search' | 'page_size' | 'ordering', value: string | number) => {
    updateParams({ [key]: value, page: 1 });
  };

  const setPage = (nextPage: number) => updateParams({ page: nextPage });
  const clearBaseFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  return {
    searchParams,
    page,
    pageSize,
    search,
    ordering,
    updateParams,
    updateBaseFilter,
    setPage,
    clearBaseFilters,
  };
};

export const useSaleFilters = () => {
  const { searchParams, page, pageSize, search, ordering, updateParams, updateBaseFilter, setPage, clearBaseFilters } =
    useBaseFilters('-sale_date');

  const fuel = parsePositiveNumber(searchParams.get('fuel'));
  const motor = parsePositiveNumber(searchParams.get('motor'));
  const currency = parsePositiveNumber(searchParams.get('currency'));
  const saleDateFrom = searchParams.get('sale_date_from') || '';
  const saleDateTo = searchParams.get('sale_date_to') || '';

  const params = useMemo<SaleListParams>(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      fuel,
      motor,
      currency,
      sale_date_from: saleDateFrom || undefined,
      sale_date_to: saleDateTo || undefined,
      ordering: ordering || undefined,
    }),
    [currency, fuel, motor, ordering, page, pageSize, saleDateFrom, saleDateTo, search]
  );

  const updateFilter = (key: string, value: string | number) => {
    if (key === 'search' || key === 'page_size' || key === 'ordering') {
      updateBaseFilter(key as 'search' | 'page_size' | 'ordering', value);
      return;
    }
    updateParams({ [key]: value, page: 1 });
  };

  return {
    filters: { page, pageSize, search, ordering, fuel, motor, currency, saleDateFrom, saleDateTo },
    params,
    updateFilter,
    setPage,
    clearFilters: clearBaseFilters,
  };
};

export const useLendingFilters = () => {
  const { searchParams, page, pageSize, search, ordering, updateParams, updateBaseFilter, setPage, clearBaseFilters } =
    useBaseFilters('-sale_date');

  const customer = parsePositiveNumber(searchParams.get('customer'));
  const fuel = parsePositiveNumber(searchParams.get('fuel'));
  const guarantor = parsePositiveNumber(searchParams.get('guarantor'));
  const status = parseStatus(searchParams.get('status'));
  const saleDateFrom = searchParams.get('sale_date_from') || '';
  const saleDateTo = searchParams.get('sale_date_to') || '';
  const endDateFrom = searchParams.get('end_date_from') || '';
  const endDateTo = searchParams.get('end_date_to') || '';

  const params = useMemo<LendingListParams>(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      customer,
      fuel,
      guarantor,
      status,
      sale_date_from: saleDateFrom || undefined,
      sale_date_to: saleDateTo || undefined,
      end_date_from: endDateFrom || undefined,
      end_date_to: endDateTo || undefined,
      ordering: ordering || undefined,
    }),
    [customer, endDateFrom, endDateTo, fuel, guarantor, ordering, page, pageSize, saleDateFrom, saleDateTo, search, status]
  );

  const updateFilter = (key: string, value: string | number) => {
    if (key === 'search' || key === 'page_size' || key === 'ordering') {
      updateBaseFilter(key as 'search' | 'page_size' | 'ordering', value);
      return;
    }
    updateParams({ [key]: value, page: 1 });
  };

  return {
    filters: {
      page,
      pageSize,
      search,
      ordering,
      customer,
      fuel,
      guarantor,
      status,
      saleDateFrom,
      saleDateTo,
      endDateFrom,
      endDateTo,
    },
    params,
    updateFilter,
    setPage,
    clearFilters: clearBaseFilters,
  };
};
