export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: string;
  rentable: boolean;
  quantity: number;
  available_quantity: number;
  publisher: string;
  publish_date: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BookListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  rentable?: boolean;
  publisher?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  low_stock?: number;
  ordering?: string;
}

export interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  rentable: boolean;
  quantity: number;
  available_quantity: number;
  publisher: string;
  publish_date: string;
  description: string;
}

export interface PaginatedBooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

