import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { lendingService, saleService, salesLookupService } from '../services/saleService';
import { lendingKeys, salesKeys, salesLookupKeys } from './saleKeys';
import type { LendingFormValues, LendingListParams, SaleFormValues, SaleListParams } from '../types/sale';

export const useSalesList = (params?: SaleListParams) =>
  useQuery({
    queryKey: salesKeys.list(params),
    queryFn: () => saleService.getSales(params).then((res) => res.data),
  });

export const useSaleDetail = (id: number, enabled = true) =>
  useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => saleService.getSale(id).then((res) => res.data),
    enabled: enabled && !!id,
  });

export const useSalesSummary = (params?: SaleListParams) =>
  useQuery({
    queryKey: salesKeys.summary(params),
    queryFn: () => saleService.getSummary(params).then((res) => res.data),
  });

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaleFormValues) => saleService.createSale(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.root });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaleFormValues }) =>
      saleService.updateSale(id, payload).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.root });
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => saleService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.root });
    },
  });
};

export const useLendingsList = (params?: LendingListParams) =>
  useQuery({
    queryKey: lendingKeys.list(params),
    queryFn: () => lendingService.getLendings(params).then((res) => res.data),
  });

export const useLendingDetail = (id: number, enabled = true) =>
  useQuery({
    queryKey: lendingKeys.detail(id),
    queryFn: () => lendingService.getLending(id).then((res) => res.data),
    enabled: enabled && !!id,
  });

export const useLendingsSummary = (params?: LendingListParams) =>
  useQuery({
    queryKey: lendingKeys.summary(params),
    queryFn: () => lendingService.getSummary(params).then((res) => res.data),
  });

export const useCreateLending = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LendingFormValues) => lendingService.createLending(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lendingKeys.root });
    },
  });
};

export const useUpdateLending = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LendingFormValues }) =>
      lendingService.updateLending(id, payload).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lendingKeys.root });
      queryClient.invalidateQueries({ queryKey: lendingKeys.detail(id) });
    },
  });
};

export const useDeleteLending = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lendingService.deleteLending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lendingKeys.root });
    },
  });
};

export const useFuelOptions = () =>
  useQuery({
    queryKey: salesLookupKeys.fuels,
    queryFn: () => salesLookupService.getFuels().then((res) => res.data),
  });

export const useMotorOptions = () =>
  useQuery({
    queryKey: salesLookupKeys.motors,
    queryFn: () => salesLookupService.getMotors().then((res) => res.data),
  });

export const useTankOptions = () =>
  useQuery({
    queryKey: salesLookupKeys.tanks,
    queryFn: () => salesLookupService.getTanks().then((res) => res.data),
  });

export const useCurrencyOptions = () =>
  useQuery({
    queryKey: salesLookupKeys.currencies,
    queryFn: () => salesLookupService.getCurrencies().then((res) => res.data),
  });

export const useCustomerOptions = () =>
  useQuery({
    queryKey: salesLookupKeys.customers,
    queryFn: () => salesLookupService.getCustomers().then((res) => res.data),
  });
