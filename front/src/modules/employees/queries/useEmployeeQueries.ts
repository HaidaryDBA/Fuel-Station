import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { employeeKeys } from './employeeKeys';
import { employeeService } from '../services/employeeService';
import type { EmployeeFormValues, EmployeeListParams } from '../types/employee';

export const useEmployeesList = (params?: EmployeeListParams) => {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.getEmployees(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const useEmployeeDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getEmployee(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormValues) => employeeService.createEmployee(data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create employee'));
    },
  });
};

export const useUpdateEmployee = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormValues) => employeeService.updateEmployee(id, data).then((res) => res.data),
    onSuccess: () => {
      toast.success('Employee updated successfully');
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update employee'));
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast.success('Employee deleted successfully');
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete employee'));
    },
  });
};

export const useActivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.activateEmployee(id).then((res) => res.data),
    onSuccess: (employee) => {
      toast.success('Employee activated successfully');
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to activate employee'));
    },
  });
};

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.deactivateEmployee(id).then((res) => res.data),
    onSuccess: (employee) => {
      toast.success('Employee deactivated successfully');
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to deactivate employee'));
    },
  });
};
