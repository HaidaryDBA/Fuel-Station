import apiClient from '@/lib/api';

import type {
  Employee,
  EmployeeFormValues,
  EmployeeListParams,
  PaginatedEmployeesResponse,
} from '../types/employee';

const EMPLOYEES_ENDPOINT = '/employees/';

// Helper function to convert form values to FormData for file uploads
const convertToFormData = (data: EmployeeFormValues): FormData => {
  const formData = new FormData();

  // Add all string/number fields
  const { picture, work_days, ...rest } = data;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Handle work_days as a list (not JSON string)
  if (work_days && Array.isArray(work_days)) {
    work_days.forEach((day) => {
      formData.append('work_days', day);
    });
  }

  // Handle picture file
  if (picture) {
    formData.append('picture', picture);
  }

  return formData;
};

export const employeeService = {
  getEmployees: (params?: EmployeeListParams) =>
    apiClient.get<PaginatedEmployeesResponse>(EMPLOYEES_ENDPOINT, { params }),

  getEmployee: (id: number) => apiClient.get<Employee>(`${EMPLOYEES_ENDPOINT}${id}/`),

  createEmployee: (data: EmployeeFormValues) =>
    apiClient.post<Employee>(EMPLOYEES_ENDPOINT, convertToFormData(data), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateEmployee: (id: number, data: EmployeeFormValues) =>
    apiClient.put<Employee>(`${EMPLOYEES_ENDPOINT}${id}/`, convertToFormData(data), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteEmployee: (id: number) => apiClient.delete(`${EMPLOYEES_ENDPOINT}${id}/`),

  activateEmployee: (id: number) =>
    apiClient.post<Employee>(`${EMPLOYEES_ENDPOINT}${id}/activate/`),

  deactivateEmployee: (id: number) =>
    apiClient.post<Employee>(`${EMPLOYEES_ENDPOINT}${id}/deactivate/`),
};

export default employeeService;
