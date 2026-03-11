import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { PartnerListParams } from '../types/partner';
import { usePartnerUiStore } from '../stores/usePartnerUiStore';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const usePartnerFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const {
    page,
    pageSize,
    search,
    joinDateFrom,
    joinDateTo,
    minShare,
    maxShare,
    ordering,
    setFilters,
    resetFilters,
  } = usePartnerUiStore();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    setFilters({
      page: parseNumber(searchParams.get('page'), 1),
      pageSize: parseNumber(searchParams.get('page_size'), 10),
      search: searchParams.get('search') || '',
      joinDateFrom: searchParams.get('join_date_from') || '',
      joinDateTo: searchParams.get('join_date_to') || '',
      minShare: searchParams.get('min_share') || '',
      maxShare: searchParams.get('max_share') || '',
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
    if (joinDateFrom) {
      params.set('join_date_from', joinDateFrom);
    }
    if (joinDateTo) {
      params.set('join_date_to', joinDateTo);
    }
    if (minShare) {
      params.set('min_share', minShare);
    }
    if (maxShare) {
      params.set('max_share', maxShare);
    }
    if (ordering && ordering !== '-id') {
      params.set('ordering', ordering);
    }

    setSearchParams(params, { replace: true });
  }, [page, pageSize, search, joinDateFrom, joinDateTo, minShare, maxShare, ordering, setSearchParams]);

  const params = useMemo<PartnerListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      join_date_from: joinDateFrom || undefined,
      join_date_to: joinDateTo || undefined,
      min_share: minShare ? Number(minShare) : undefined,
      max_share: maxShare ? Number(maxShare) : undefined,
      ordering: ordering || undefined,
    };
  }, [page, pageSize, search, joinDateFrom, joinDateTo, minShare, maxShare, ordering]);

  const updateFilter = (
    key:
      | 'search'
      | 'joinDateFrom'
      | 'joinDateTo'
      | 'minShare'
      | 'maxShare'
      | 'ordering'
      | 'pageSize',
    value: string | number
  ) => {
    setFilters({
      [key]: value,
      page:
        key === 'pageSize' ||
        key === 'search' ||
        key === 'joinDateFrom' ||
        key === 'joinDateTo' ||
        key === 'minShare' ||
        key === 'maxShare' ||
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
    filters: {
      page,
      pageSize,
      search,
      joinDateFrom,
      joinDateTo,
      minShare,
      maxShare,
      ordering,
    },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};
