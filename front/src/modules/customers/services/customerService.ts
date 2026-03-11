import apiClient from '@/lib/api';

import type {
  Customer,
  CustomerFormValues,
  CustomerListParams,
  PaginatedCustomersResponse,
} from '../types/customer';

const CUSTOMERS_ENDPOINT = '/employees/customers/';

export const customerService = {
  getCustomers: (params?: CustomerListParams) =>
    apiClient.get<PaginatedCustomersResponse>(CUSTOMERS_ENDPOINT, { params }),

  getCustomer: (id: number) => apiClient.get<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`),

  createCustomer: (payload: CustomerFormValues) =>
    apiClient.post<Customer>(CUSTOMERS_ENDPOINT, payload),

  updateCustomer: (id: number, payload: CustomerFormValues) =>
    apiClient.patch<Customer>(`${CUSTOMERS_ENDPOINT}${id}/`, payload),

  deleteCustomer: (id: number) => apiClient.delete(`${CUSTOMERS_ENDPOINT}${id}/`),
};

export default customerService;
