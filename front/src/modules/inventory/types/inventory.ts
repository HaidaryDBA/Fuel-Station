// Inventory Module Types
// Types for Fuel, TankStorage, FuelMotor, PriceHistory, and InventoryTransaction

export interface Fuel {
  id: number;
  fuel_name: string;
  type: string;
}

export interface FuelFormValues {
  fuel_name: string;
  type: string;
}

export interface TankStorage {
  id: number;
  Fuel: number;
  fuel_name?: string;
  tank_number: number;
  capacity: string;
  min_level_alert: number;
}

export interface TankStorageFormValues {
  Fuel: number;
  tank_number: number;
  capacity: string;
  min_level_alert: number;
}

export interface FuelMotor {
  id: number;
  tank_id: number;
  tank_name?: string;
  motor_name: string;
  fuel_id: number;
  fuel_name?: string;
}

export interface FuelMotorFormValues {
  tank_id: number;
  motor_name: string;
  fuel_id: number;
}

export interface PriceHistory {
  id: number;
  fuel: number;
  fuel_name?: string;
  price: number;
  start_date: string;
  end_date: string | null;
}

export interface PriceHistoryFormValues {
  fuel: number;
  price: number;
  start_date: string;
  end_date?: string | null;
}

export type TransactionType = 
  | 'purchase_in'
  | 'sale_out'
  | 'lending_out'
  | 'return_in'
  | 'adjustment';

export type ReferenceType = 
  | 'sale'
  | 'lending'
  | 'purchase'
  | 'adjustment';

export type AdjustmentDirection = 'in' | 'out';

export interface InventoryTransaction {
  id: number;
  tank_id: number;
  tank_name?: string;
  fuel_id: number;
  fuel_name?: string;
  transaction_type: TransactionType;
  quantity: string;
  reference_type: ReferenceType;
  reference_id: number;
  date_time: string;
  adjustment_direction?: AdjustmentDirection | null;
  created_at: number | null;
  created_by?: string;
  description: string;
}

export interface InventoryTransactionFormValues {
  tank_id: number;
  fuel_id: number;
  transaction_type: TransactionType;
  quantity: number;
  reference_type: ReferenceType;
  reference_id: number;
  date_time: string;
  adjustment_direction?: AdjustmentDirection | null;
  description: string;
}

export interface InventoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  transaction_type?: TransactionType;
  tank_id?: number;
  fuel_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedInventoryResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
