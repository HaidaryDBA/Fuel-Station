export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  fuel_id?: number;
  tank_id?: number;
  currency_id?: number;
  account_id?: number;
  supplier_id?: number;
  customer_id?: number;
}

export interface TankStockReportRow {
  tank_id: number;
  tank_number: number;
  fuel_id: number;
  fuel_name: string;
  capacity: string;
  current_liters: string;
  remaining_capacity: string;
  min_level_alert: number;
  low_stock: boolean;
}

export interface AccountBalanceReportRow {
  account_id: number;
  account_name: string;
  account_type: string;
  currency_id: number;
  currency_code: string;
  native_balance: string;
  base_balance: string;
}

export interface DailySeriesPoint {
  date: string;
  quantity?: string;
  total_amount?: string;
  total_amount_in_base_currency?: string;
  total_paid_in_base_currency?: string;
  total_remaining_in_base_currency?: string;
  count?: number;
}

export interface OutstandingLendingRow {
  lending_id: number;
  customer_name: string;
  fuel_name: string;
  tank_name?: string;
  sale_date: string;
  end_date: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: string;
}

export interface PurchaseSummaryRow {
  date: string;
  liters: string;
  total_amount_in_base_currency: string;
  total_paid_in_base_currency: string;
  total_remaining_in_base_currency: string;
  count: number;
}

export interface ReportsOverview {
  inventory: {
    summary: {
      tank_count: number;
      total_current_liters: string;
      low_stock_count: number;
    };
    rows: TankStockReportRow[];
  };
  finance: {
    summary: {
      as_of_date: string;
      base_currency_code: string;
      total_cash_base: string;
      total_exchange_base: string;
      currency_totals: Array<{
        currency_code: string;
        native_balance: string;
      }>;
    };
    rows: AccountBalanceReportRow[];
  };
  sales: {
    summary: {
      count: number;
      total_quantity: string;
      total_amount_in_base_currency: string;
    };
    daily_series: DailySeriesPoint[];
  };
  lendings: {
    outstanding: {
      summary: {
        count: number;
        total_remaining: string;
      };
      rows: OutstandingLendingRow[];
    };
    due_soon: {
      summary: {
        count: number;
        total_remaining: string;
        window_start: string;
        window_end: string;
        overdue_count: number;
      };
      rows: OutstandingLendingRow[];
    };
  };
  purchases: {
    summary: {
      count: number;
      total_liters: string;
      total_amount_in_base_currency: string;
      total_paid_in_base_currency: string;
      total_remaining_in_base_currency: string;
    };
    daily_series: PurchaseSummaryRow[];
  };
  expenses: {
    count: number;
    total_amount_in_base_currency: string;
  };
  partner_debts: {
    count: number;
    total_outstanding: string;
    base_currency_code: string;
  };
  salaries: {
    count: number;
    total_net_salary: string;
  };
  currency_rates: {
    base_currency_code: string;
    latest: Array<{
      date: string;
      from_currency__code: string;
      to_currency__code: string;
      rate_value: string;
    }>;
  };
}

export interface TankStockReportResponse {
  summary: ReportsOverview['inventory']['summary'];
  rows: TankStockReportRow[];
}

export interface AccountBalancesReportResponse {
  summary: ReportsOverview['finance']['summary'];
  rows: AccountBalanceReportRow[];
}

export interface SalesDailyReportResponse {
  summary: ReportsOverview['sales']['summary'];
  daily_series: DailySeriesPoint[];
}

export interface OutstandingLendingReportResponse {
  summary: ReportsOverview['lendings']['outstanding']['summary'];
  rows: OutstandingLendingRow[];
}

export interface DueSoonLendingReportResponse {
  summary: ReportsOverview['lendings']['due_soon']['summary'];
  rows: OutstandingLendingRow[];
}

export interface PurchaseSummaryReportResponse {
  summary: ReportsOverview['purchases']['summary'];
  daily_series: PurchaseSummaryRow[];
}

export interface SalesReportFilters {
  start_date?: string;
  end_date?: string;
  fuel_type?: string;
}

export interface DailySalesReportRow {
  date: string;
  fuel: string;
  liters_sold: string;
  price: string;
  total_amount: string;
}

export interface MonthlySalesSummaryRow {
  fuel: string;
  liters_sold: string;
  total_revenue: string;
}

export interface SalesByFuelTypeRow {
  fuel: string;
  liters_sold: string;
  total_revenue: string;
}

export interface InventoryReportFilters {
  start_date?: string;
  end_date?: string;
  fuel_type?: string;
}

export interface TankStatusReportRow {
  tank_number: number;
  fuel: string;
  capacity: string;
  current_quantity: string;
}

export interface FuelStockSummaryRow {
  fuel: string;
  total_liters: string;
}

export interface FuelMovementRow {
  date: string;
  transaction_type: string;
  quantity: string;
  reference: string;
}

export interface FinanceReportFilters {
  start_date?: string;
  end_date?: string;
  account_id?: number;
}

export interface FinanceAccountBalanceRow {
  account_id: number;
  account: string;
  currency: string;
  balance: string;
}

export interface MoneyFlowRow {
  date: string;
  transaction_type: string;
  amount: string;
  currency: string;
  account: string;
  description: string;
}
