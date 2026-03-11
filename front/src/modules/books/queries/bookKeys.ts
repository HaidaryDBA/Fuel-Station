import type { BookListParams } from '../types/book';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params?: BookListParams) => [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookKeys.details(), id] as const,
};

