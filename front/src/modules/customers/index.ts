export { default as CustomerDetailCard } from './components/CustomerDetailCard';
export { default as CustomerForm } from './components/CustomerForm';
export { default as CustomerTable } from './components/CustomerTable';

export { useCustomerFilters } from './hooks/useCustomerFilters';

export { customerKeys } from './queries/customerKeys';
export {
  useCustomersList,
  useCustomerDetail,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from './queries/useCustomerQueries';

export { customerFormSchema } from './schemas/customerSchema';

export { useCustomerUiStore } from './stores/useCustomerUiStore';

export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as CustomerFormPage } from './pages/CustomerFormPage';
export { default as CustomersListPage } from './pages/CustomersListPage';

export type {
  Customer,
  CustomerGender,
  CustomerListParams,
  CustomerFormValues,
  PaginatedCustomersResponse,
} from './types/customer';

