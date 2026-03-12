export const reportKeys = {
  root: ['reports-module'] as const,
  salesReportDaily: (filters?: unknown) => [...reportKeys.root, 'sales-report-daily', filters ?? {}] as const,
  salesReportMonthly: (filters?: unknown) => [...reportKeys.root, 'sales-report-monthly', filters ?? {}] as const,
  salesReportByFuel: (filters?: unknown) => [...reportKeys.root, 'sales-report-by-fuel', filters ?? {}] as const,
  inventoryTankStatus: (filters?: unknown) => [...reportKeys.root, 'inventory-tank-status', filters ?? {}] as const,
  inventoryFuelStock: (filters?: unknown) => [...reportKeys.root, 'inventory-fuel-stock', filters ?? {}] as const,
  inventoryMovements: (filters?: unknown) => [...reportKeys.root, 'inventory-movements', filters ?? {}] as const,
  financeAccountBalances: (filters?: unknown) => [...reportKeys.root, 'finance-account-balances', filters ?? {}] as const,
  financeMoneyFlow: (filters?: unknown) => [...reportKeys.root, 'finance-money-flow', filters ?? {}] as const,
};
