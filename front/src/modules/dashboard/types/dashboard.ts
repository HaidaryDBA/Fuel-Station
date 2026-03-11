export interface DashboardAccountBalance {
  account_id: number;
  account_name: string;
  currency: string;
  balance: string;
}

export interface DashboardFuelInventory {
  fuel_id: number;
  fuel: string;
  liters: string;
}

export interface DashboardSalesByCurrency {
  currency: string;
  amount: string;
}

export interface DashboardTodaySales {
  total_liters: string;
  total_amount_base: string;
  base_currency_code: string;
  total_amount_by_currency: DashboardSalesByCurrency[];
}

export interface DashboardSummary {
  cash_accounts: DashboardAccountBalance[];
  exchange_accounts: DashboardAccountBalance[];
  fuel_inventory: DashboardFuelInventory[];
  today_sales: DashboardTodaySales;
}
