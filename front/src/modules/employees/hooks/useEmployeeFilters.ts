import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { EmployeeListParams } from '../types/employee';

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

type FilterKey =
  | 'search'
  | 'roleName'
  | 'status'
  | 'membershipType'
  | 'ordering'
  | 'pageSize';

export const useEmployeeFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseNumber(searchParams.get('page'), 1);
  const pageSize = parseNumber(searchParams.get('page_size'), 10);
  const search = searchParams.get('search') || '';
  const roleName = searchParams.get('role_name') || '';
  const status = searchParams.get('status') || '';
  const membershipType = searchParams.get('membership_type') || '';
  const ordering = searchParams.get('ordering') || '-created_at';

  const params = useMemo<EmployeeListParams>(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      role_name: roleName ? (roleName as EmployeeListParams['role_name']) : undefined,
      status: status ? (status as EmployeeListParams['status']) : undefined,
      membership_type: membershipType
        ? (membershipType as EmployeeListParams['membership_type'])
        : undefined,
      ordering: ordering || undefined,
    };
  }, [membershipType, ordering, page, pageSize, roleName, search, status]);

  const updateFilter = (key: FilterKey, value: string | number) => {
    const next = new URLSearchParams(searchParams);

    const mappedKey =
      key === 'roleName'
        ? 'role_name'
        : key === 'membershipType'
          ? 'membership_type'
          : key === 'pageSize'
            ? 'page_size'
            : key;

    if (!value) {
      next.delete(mappedKey);
    } else {
      next.set(mappedKey, String(value));
    }

    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(nextPage));
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return {
    filters: {
      page,
      pageSize,
      search,
      roleName,
      status,
      membershipType,
      ordering,
    },
    params,
    updateFilter,
    setPage,
    clearFilters,
  };
};
