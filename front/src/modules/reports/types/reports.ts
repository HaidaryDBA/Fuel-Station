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
