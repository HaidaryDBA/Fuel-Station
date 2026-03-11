import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { extractAxiosError } from '@/utils/extractError';

import { partnerKeys } from './partnerKeys';
import { partnerService } from '../services/partnerService';
import type { PartnerFormValues, PartnerListParams } from '../types/partner';

export const usePartnersList = (params?: PartnerListParams) => {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerService.getPartners(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
};

export const usePartnerDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnerService.getPartner(id).then((res) => res.data),
    enabled: enabled && Number.isFinite(id),
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerFormValues) =>
      partnerService.createPartner(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Partner created successfully');
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to create partner'));
    },
  });
};

export const useUpdatePartner = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerFormValues) =>
      partnerService.updatePartner(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success('Partner updated successfully');
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to update partner'));
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => partnerService.deletePartner(id),
    onSuccess: () => {
      toast.success('Partner deleted successfully');
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, 'Failed to delete partner'));
    },
  });
};
