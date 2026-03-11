import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { InventoryListParams, TransactionType } from '../types/inventory';
import { useFuelUiStore, useTankStorageUiStore, useFuelMotorUiStore, usePriceHistoryUiStore, useInventoryTransactionUiStore } from '../stores/useInventoryUiStore';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isTransactionType = (value: string): value is TransactionType => {
  return ['purchase_in', 'sale_out', 'lending_out', 'return_in', 'adjustment'].includes(value);
};

// Generic filter hook
const createUseFilters = (store: any) => {
  return () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initializedRef = useRef(false);

    const { page, pageSize, search, ordering, setFilters, resetFilters } = store();

    useEffect(() => {
      if (initializedRef.current) {
        return;
      }

      initializedRef.current = true;

      setFilters({
        page: parseNumber(searchParams.get('page'), 1),
        pageSize: parseNumber(searchParams.get('page_size'), 10),
        search: searchParams.get('search') || '',
        ordering: searchParams.get('ordering') || '-id',
      });
    }, [searchParams, setFilters]);

    useEffect(() => {
      const params = new URLSearchParams();

      if (page > 1) {
        params.set('page', String(page));
      }
      if (pageSize !== 10) {
        params.set('page_size', String(pageSize));
      }
      if (search) {
        params.set('search', search);
      }
      if (ordering && ordering !== '-id') {
        params.set('ordering', ordering);
      }

      setSearchParams(params, { replace: true });
    }, [page, pageSize, search, ordering, setSearchParams]);

    const params = useMemo<InventoryListParams>(() => {
      return {
        page,
        page_size: pageSize,
        search: search || undefined,
        ordering: ordering || undefined,
      };
    }, [page, pageSize, search, ordering]);

    const updateFilter = (key: 'search' | 'ordering' | 'pageSize', value: string | number) => {
      setFilters({
        [key]: value,
        page: key === 'pageSize' || key === 'search' || key === 'ordering' ? 1 : page,
      } as Parameters<typeof setFilters>[0]);
    };

    const setPage = (nextPage: number) => {
      setFilters({ page: nextPage });
    };

    const clearFilters = () => {
      resetFilters();
    };

    return {
      filters: { page, pageSize, search, ordering },
      params,
      updateFilter,
      setPage,
      clearFilters,
    };
  };
};

// Export specific filter hooks
export const useFuelFilters = createUseFilters(useFuelUiStore);
export const useTankStorageFilters = createUseFilters(useTankStorageUiStore);
export const useFuelMotorFilters = createUseFilters(useFuelMotorUiStore);
export const usePriceHistoryFilters = createUseFilters(usePriceHistoryUiStore);

export const useInventoryTransactionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const { 
    page, pageSize, search, ordering, 
    transactionType, tankId, fuelId, dateFrom, dateTo,
    setFilters, setTransactionFilters, resetFilters 
  } = useInventoryTransactionUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      ordering: searchParams.get('ordering') || '-date_time',
    });
    setTransactionFilters({
      transactionType: isTransactionType(searchParams.get('transaction_type') || '')
        ? (searchParams.get('transaction_type') as TransactionType)
        : '',
      tankId: parseNumber(searchParams.get('tank_id'), 0) || null,
      fuelId: parseNumber(searchParams.get('fuel_id'), 0) || null,
      dateFrom: searchParams.get('date_from') || '',
      dateTo: searchParams.get('date_to') || '',
    });
  }, [searchParams, setFilters, setTransactionFilters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('page_size', String(pageSize));
    if (search) params.set('search', search);
    if (ordering && ordering !== '-date_time') params.set('ordering', ordering);
    if (transactionType) params.set('transaction_type', transactionType);
    if (tankId) params.set('tank_id', String(tankId));
    if (fuelId) params.set('fuel_id', String(fuelId));
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, ordering, transactionType, tankId, fuelId, dateFrom, dateTo, setSearchParams]);

  const params = useMemo<InventoryListParams>(() => ({
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering: ordering || undefined,
    transaction_type: transactionType || undefined,
    tank_id: tankId || undefined,
    fuel_id: fuelId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [page, pageSize, search, ordering, transactionType, tankId, fuelId, dateFrom, dateTo]);

  const updateFilter = (key: string, value: string | number | null) => {
    if (key === 'transactionType' || key === 'tankId' || key === 'fuelId' || key === 'dateFrom' || key === 'dateTo') {
      setTransactionFilters({ [key]: value });
    } else {
      setFilters({ [key]: value, page: 1 });
    }
  };

  const setPage = (nextPage: number) => setFilters({ page: nextPage });
  const clearFilters = () => resetFilters();

  return {
    filters: { page, pageSize, search, ordering, transactionType, tankId, fuelId, dateFrom, dateTo },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};
