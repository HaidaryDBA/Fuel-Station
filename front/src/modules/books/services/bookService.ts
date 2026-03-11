import apiClient from '@/lib/api';

import type {
  Book,
  BookFormValues,
  BookListParams,
  PaginatedBooksResponse,
} from '../types/book';

const BOOKS_ENDPOINT = '/books/';

export const bookService = {
  getBooks: (params?: BookListParams) =>
    apiClient.get<PaginatedBooksResponse>(BOOKS_ENDPOINT, { params }),

  getBook: (id: number) => apiClient.get<Book>(`${BOOKS_ENDPOINT}${id}/`),

  createBook: (data: BookFormValues) =>
    apiClient.post<Book>(BOOKS_ENDPOINT, {
      ...data,
      publish_date: data.publish_date || null,
    }),

  updateBook: (id: number, data: BookFormValues) =>
    apiClient.put<Book>(`${BOOKS_ENDPOINT}${id}/`, {
      ...data,
      publish_date: data.publish_date || null,
    }),

  deleteBook: (id: number) => apiClient.delete(`${BOOKS_ENDPOINT}${id}/`),
};

export default bookService;

