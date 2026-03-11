import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { CustomerListParams } from '../types/customer';
import { useCustomerUiStore } from '../stores/useCustomerUiStore';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const useCustomerFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const { page, pageSize, search, isActive, ordering, setFilters, resetFilters } =
    useCustomerUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      isActive:
        searchParams.get('is_active') === 'true' || searchParams.get('is_active') === 'false'
          ? (searchParams.get('is_active') as 'true' | 'false')
          : '',
      ordering: searchParams.get('ordering') || '-created_at',
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
    if (isActive) {
      params.set('is_active', isActive);
    }
    if (ordering && ordering !== '-created_at') {
      params.set('ordering', ordering);
    }

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, isActive, ordering, setSearchParams]);

  const params = useMemo<CustomerListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      is_active: isActive === '' ? undefined : isActive === 'true',
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, isActive, ordering]);

  const updateFilter = (
    key: 'search' | 'isActive' | 'ordering' | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page:
        key === 'pageSize' ||
        key === 'search' ||
        key === 'isActive' ||
        key === 'ordering'
          ? 1
          : page,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => {
    setFilters({ page: nextPage });
  };

  const clearFilters = () => {
    resetFilters();
  };

  return {
    filters: { page, pageSize, search, isActive, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};

