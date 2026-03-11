import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { BookListParams } from '../types/book';
import { useBookUiStore } from '../stores/useBookUiStore';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const useBookFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const {
    page,
    pageSize,
    search,
    category,
    publisher,
    rentable,
    inStock,
    ordering,
    setFilters,
    resetFilters,
  } = useBookUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      publisher: searchParams.get('publisher') || '',
      rentable:
        searchParams.get('rentable') === 'true' || searchParams.get('rentable') === 'false'
          ? (searchParams.get('rentable') as 'true' | 'false')
          : '',
      inStock:
        searchParams.get('in_stock') === 'true' || searchParams.get('in_stock') === 'false'
          ? (searchParams.get('in_stock') as 'true' | 'false')
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
    if (category) {
      params.set('category', category);
    }
    if (publisher) {
      params.set('publisher', publisher);
    }
    if (rentable) {
      params.set('rentable', rentable);
    }
    if (inStock) {
      params.set('in_stock', inStock);
    }
    if (ordering && ordering !== '-created_at') {
      params.set('ordering', ordering);
    }

    setSearchParams(params, { replace: true });
  }, [
    page,
    pageSize,
    search,
    category,
    publisher,
    rentable,
    inStock,
    ordering,
    setSearchParams,
  ]);

  const params = useMemo<BookListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      category: category || undefined,
      publisher: publisher || undefined,
      rentable: rentable === '' ? undefined : rentable === 'true',
      in_stock: inStock === '' ? undefined : inStock === 'true',
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, category, publisher, rentable, inStock, ordering]);

  const updateFilter = (
    key:
      | 'search'
      | 'category'
      | 'publisher'
      | 'rentable'
      | 'inStock'
      | 'ordering'
      | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page: key === 'pageSize' ? 1 : key === 'search' || key === 'category' || key === 'publisher' || key === 'rentable' || key === 'inStock' || key === 'ordering' ? 1 : page,
    } as Parameters<typeof setFilters>[0]);
  };

  const setPage = (nextPage: number) => {
    setFilters({ page: nextPage });
  };

  const clearFilters = () => {
    resetFilters();
  };

  return {
    filters: { page, pageSize, search, category, publisher, rentable, inStock, ordering },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};

