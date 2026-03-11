export const salesKeys = {
  root: ['sales-module', 'sales'] as const,
  lists: () => [...salesKeys.root, 'list'] as const,
  list: (params?: unknown) => [...salesKeys.lists(), params ?? {}] as const,
  details: () => [...salesKeys.root, 'detail'] as const,
  detail: (id: number) => [...salesKeys.details(), id] as const,
  summary: (params?: unknown) => [...salesKeys.root, 'summary', params ?? {}] as const,
};

export const lendingKeys = {
  root: ['sales-module', 'lendings'] as const,
  lists: () => [...lendingKeys.root, 'list'] as const,
  list: (params?: unknown) => [...lendingKeys.lists(), params ?? {}] as const,
  details: () => [...lendingKeys.root, 'detail'] as const,
  detail: (id: number) => [...lendingKeys.details(), id] as const,
  summary: (params?: unknown) => [...lendingKeys.root, 'summary', params ?? {}] as const,
};

export const salesLookupKeys = {
  root: ['sales-module', 'lookups'] as const,
  fuels: ['sales-module', 'lookups', 'fuels'] as const,
  motors: ['sales-module', 'lookups', 'motors'] as const,
  tanks: ['sales-module', 'lookups', 'tanks'] as const,
  currencies: ['sales-module', 'lookups', 'currencies'] as const,
  customers: ['sales-module', 'lookups', 'customers'] as const,
};
