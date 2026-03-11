export interface Partner {
  id: number;
  first_name: string;
  father_name: string;
  last_name: string;
  phone: string;
  main_address: string;
  current_address: string;
  date_of_birth: string;
  share_percentage: string;
  join_date: string;
  full_name: string;
}

export interface PartnerFormValues {
  first_name: string;
  father_name: string;
  last_name: string;
  phone: string;
  main_address: string;
  current_address: string;
  date_of_birth: string;
  share_percentage: number;
  join_date: string;
}

export interface PartnerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  join_date_from?: string;
  join_date_to?: string;
  min_share?: number;
  max_share?: number;
  ordering?: string;
}

export interface PaginatedPartnersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Partner[];
}
