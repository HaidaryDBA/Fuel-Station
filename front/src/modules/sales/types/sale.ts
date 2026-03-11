export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FuelOption {
  id: number;
  fuel_name: string;
  type: string;
}

export interface MotorOption {
  id: number;
  tank_id: number;
  tank_name?: string;
  motor_name: string;
  fuel_id: number;
  fuel_name?: string;
}

export interface TankOption {
  id: number;
  Fuel: number;
  fuel_name?: string;
  tank_number: number;
}

export interface CurrencyOption {
  id: number;
  code: string;
  name: string;
  is_base?: boolean;
}

export interface CustomerOption {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
}

export interface Sale {
  id: number;
  sale_id: number;
  fuel: number;
  fuel_name: string;
  motor: number;
  motor_name: string;
  sale_date: string;
  amount: string;
  unit_price: string;
  currency: number;
  currency_code: string;
  currency_rate: string;
  base_currency_code: string;
  total_amount: string;
  total_amount_in_base_currency: string;
  created_at: string;
  updated_at: string;
}

export interface SaleFormValues {
  fuel: number;
  motor: number;
  sale_date: string;
  amount: number;
  unit_price: number;
  currency: number;
}

export interface SaleSummary {
  count: number;
  total_quantity: string;
  total_amount: string;
  total_amount_in_base_currency: string;
  base_currency_code: string;
}

export type LendingStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Lending {
  id: number;
  lending_id: number;
  customer: number;
  customer_name: string;
  fuel: number;
  fuel_name: string;
  tank_id: number | null;
  tank_name?: string;
  guarantor: number | null;
  guarantor_name?: string;
  amount: string;
  unit_price: string;
  discount: string;
  gross_amount: string;
  total_amount: string;
  sale_date: string;
  end_date: string;
  paid_amount: string;
  remaining_amount: string;
  status: LendingStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface LendingFormValues {
  customer: number;
  fuel: number;
  tank_id: number;
  guarantor: number | null;
  amount: number;
  unit_price: number;
  discount: number;
  sale_date: string;
  end_date: string;
  paid_amount: number;
}

export interface LendingSummary {
  count: number;
  total_amount: string;
  total_discount: string;
  total_paid: string;
  total_remaining: string;
  paid_count: number;
  overdue_count: number;
}

export interface SaleListParams {
  page?: number;
  page_size?: number;
  search?: string;
  fuel?: number;
  motor?: number;
  currency?: number;
  sale_date_from?: string;
  sale_date_to?: string;
  ordering?: string;
}

export interface LendingListParams {
  page?: number;
  page_size?: number;
  search?: string;
  customer?: number;
  fuel?: number;
  tank_id?: number;
  guarantor?: number;
  status?: LendingStatus;
  sale_date_from?: string;
  sale_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  ordering?: string;
}
