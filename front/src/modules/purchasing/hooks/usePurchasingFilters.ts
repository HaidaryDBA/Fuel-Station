import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type {
  OrderPurchaseListParams,
  PaymentStatus,
  PurchaseListParams,
  SupplierListParams,
} from '../types/purchasing';

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

const parseStatus = (value: string | null): PaymentStatus | undefined => {
  if (value === 'completed' || value === 'remaining') {
    return value;
  }
  return undefined;
};

const useBaseFilters = (defaultOrdering: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const page = parseNumber(searchParams.get('page'), 1) || 1;
  const pageSize = parseNumber(searchParams.get('page_size'), 10) || 10;
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || defaultOrdering;

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
  }, []);

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
    updateParams({
      [key]: value,
      page: 1,
    });
  };

  const setPage = (nextPage: number) => updateParams({ page: nextPage });

  const clearBaseFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

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

export const useSupplierFilters = () => {
  const { page, pageSize, search, ordering, updateBaseFilter, setPage, clearBaseFilters } = useBaseFilters('supplier_name');

  const params = useMemo<SupplierListParams>(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      ordering: ordering || undefined,
    }),
    [ordering, page, pageSize, search]
  );

  return {
    filters: { page, pageSize, search, ordering },
    params,
    updateFilter: updateBaseFilter,
    setPage,
    clearFilters: clearBaseFilters,
  };
};

export const usePurchaseFilters = () => {
  const { searchParams, page, pageSize, search, ordering, updateBaseFilter, updateParams, setPage, clearBaseFilters } =
    useBaseFilters('-purchase_date');

  const supplier = parsePositiveNumber(searchParams.get('supplier'));
  const fuel = parsePositiveNumber(searchParams.get('fuel'));
  const partner = parsePositiveNumber(searchParams.get('partner'));
  const currency = parsePositiveNumber(searchParams.get('currency'));
  const paymentStatus = parseStatus(searchParams.get('payment_status'));
  const purchaseDateFrom = searchParams.get('purchase_date_from') || '';
  const purchaseDateTo = searchParams.get('purchase_date_to') || '';

  const params = useMemo<PurchaseListParams>(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      supplier,
      fuel,
      partner,
      currency,
      payment_status: paymentStatus,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      ordering: ordering || undefined,
    }),
    [currency, fuel, ordering, page, pageSize, partner, paymentStatus, purchaseDateFrom, purchaseDateTo, search, supplier]
  );

  const updateFilter = (key: string, value: string | number) => {
    if (key === 'search' || key === 'page_size' || key === 'ordering') {
      updateBaseFilter(key as 'search' | 'page_size' | 'ordering', value);
      return;
    }
    updateParams({
      [key]: value,
      page: 1,
    });
  };

  return {
    filters: {
      page,
      pageSize,
      search,
      ordering,
      supplier,
      fuel,
      partner,
      currency,
      paymentStatus,
      purchaseDateFrom,
      purchaseDateTo,
    },
    params,
    updateFilter,
    setPage,
    clearFilters: clearBaseFilters,
  };
};

export const useOrderPurchaseFilters = () => {
  const { searchParams, page, pageSize, search, ordering, updateBaseFilter, updateParams, setPage, clearBaseFilters } =
    useBaseFilters('-date');

  const supplier = parsePositiveNumber(searchParams.get('supplier'));
  const currency = parsePositiveNumber(searchParams.get('currency'));
  const tanker = parsePositiveNumber(searchParams.get('tanker'));
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  const params = useMemo<OrderPurchaseListParams>(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      supplier,
      currency,
      tanker,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      ordering: ordering || undefined,
    }),
    [currency, dateFrom, dateTo, ordering, page, pageSize, search, supplier, tanker]
  );

  const updateFilter = (key: string, value: string | number) => {
    if (key === 'search' || key === 'page_size' || key === 'ordering') {
      updateBaseFilter(key as 'search' | 'page_size' | 'ordering', value);
      return;
    }
    updateParams({
      [key]: value,
      page: 1,
    });
  };

  return {
    filters: { page, pageSize, search, ordering, supplier, currency, tanker, dateFrom, dateTo },
    params,
    updateFilter,
    setPage,
    clearFilters: clearBaseFilters,
  };
};

