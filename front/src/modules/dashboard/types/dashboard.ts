export interface DashboardAccountBalance {
  account_id: number;
  account_name: string;
  currency: string;
  balance: string;
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

export interface DashboardTankStatus {
  tank_number: number;
  fuel_type: string;
  capacity_tons: string;
  capacity_liters: string;
  current_liters: string;
  current_tons: string;
  min_level_alert_tons: string;
  min_level_alert_liters: string;
  is_below_min_level: boolean;
  is_over_capacity: boolean;
}

export interface DashboardTodaySalesByFuel {
  fuel_name: string;
  liters_sold_today: string;
  total_amount_today: string;
}

export interface DashboardSummary {
  cash_accounts: DashboardAccountBalance[];
  exchange_accounts: DashboardAccountBalance[];
  today_sales: DashboardTodaySales;
}
