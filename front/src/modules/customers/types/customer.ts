export type CustomerGender = "male" | "female" | "other";

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  gender?: CustomerGender;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface PaginatedCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}
