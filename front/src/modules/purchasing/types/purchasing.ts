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

export interface CurrencyOption {
  id: number;
  code: string;
  name: string;
  is_base?: boolean;
}

export interface CurrencyRateOption {
  id: number;
  from_currency: number;
  from_currency_code: string;
  to_currency: number;
  to_currency_code: string;
  rate_value: string;
  date: string;
}

export interface PartnerOption {
  id: number;
  full_name: string;
}

export interface TankOption {
  id: number;
  Fuel: number;
  fuel_name?: string;
  tank_number: number;
}

export interface Supplier {
  id: number;
  supplier_id: number;
  supplier_name: string;
  phone: string;
  address: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormValues {
  supplier_name: string;
  phone: string;
  address: string;
  description: string;
}

export type PaymentStatus = 'completed' | 'remaining';

export interface Purchase {
  id: number;
  purchase_id: number;
  fuel: number;
  fuel_name: string;
  supplier: number;
  supplier_name: string;
  partner: number;
  partner_name: string;
  purchase_date: string;
  amount_ton: string;
  density: string;
  weight_kg: string;
  total_liter: string;
  unit_price: string;
  total_amount: string;
  currency: number;
  currency_code: string;
  currency_rate: string;
  base_currency_code: string;
  total_amount_in_base_currency: string;
  invoice_number: string;
  paid_currency: number;
  paid_currency_code: string;
  paid_currency_rate: string;
  paid_amount: string;
  paid_amount_in_purchase_currency: string;
  paid_amount_in_base_currency: string;
  pay_date: string | null;
  remaining_amount: string;
  remaining_amount_in_base_currency: string;
  payment_status: PaymentStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseFormValues {
  fuel: number;
  supplier: number;
  partner: number;
  purchase_date: string;
  amount_ton: number;
  density: number;
  unit_price: number;
  currency: number;
  invoice_number: string;
  paid_currency: number;
  paid_amount: number;
  pay_date: string;
}

export interface OrderPurchase {
  id: number;
  order_purchase_id: number;
  order_id: number;
  supplier: number;
  supplier_name: string;
  amount_per_ton: string;
  density: string;
  density_per_ton: string;
  total_liter: string;
  purchase_price: string;
  currency: number;
  currency_code: string;
  currency_rate: string;
  base_currency_code: string;
  currency_cost: string;
  transport_cost: string;
  estimated_total_cost: string;
  tanker: number;
  tanker_name: string;
  date: string;
  created_by: number;
  created_by_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OrderPurchaseFormValues {
  supplier: number;
  amount_per_ton: number;
  density: number;
  purchase_price: number;
  currency: number;
  transport_cost: number;
  tanker: number;
  date: string;
  description: string;
}

export interface SupplierListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface PurchaseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  supplier?: number;
  fuel?: number;
  partner?: number;
  currency?: number;
  paid_currency?: number;
  payment_status?: PaymentStatus;
  purchase_date_from?: string;
  purchase_date_to?: string;
  ordering?: string;
}

export interface OrderPurchaseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  supplier?: number;
  currency?: number;
  tanker?: number;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}
