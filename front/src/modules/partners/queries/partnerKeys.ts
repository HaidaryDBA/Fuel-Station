import type { PartnerListParams } from '../types/partner';

export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (params?: PartnerListParams) => [...partnerKeys.lists(), params] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: number) => [...partnerKeys.details(), id] as const,
};
