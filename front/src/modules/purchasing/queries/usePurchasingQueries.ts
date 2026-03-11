import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  orderPurchaseService,
  purchasingLookupService,
  purchaseService,
  supplierService,
} from '../services/purchasingService';
import { orderPurchaseKeys, purchaseKeys, purchasingLookupKeys, supplierKeys } from './purchasingKeys';
import type { OrderPurchaseListParams, PurchaseListParams, SupplierListParams } from '../types/purchasing';

export const useSuppliersList = (params?: SupplierListParams) =>
  useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.getSuppliers(params).then((res) => res.data),
  });

export const useSupplierDetail = (id: number) =>
  useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.getSupplier(id).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: purchasingLookupKeys.suppliers });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof supplierService.updateSupplier>[1] }) =>
      supplierService.updateSupplier(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchasingLookupKeys.suppliers });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: purchasingLookupKeys.suppliers });
    },
  });
};

export const usePurchasesList = (params?: PurchaseListParams) =>
  useQuery({
    queryKey: purchaseKeys.list(params),
    queryFn: () => purchaseService.getPurchases(params).then((res) => res.data),
  });

export const usePurchaseDetail = (id: number) =>
  useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => purchaseService.getPurchase(id).then((res) => res.data),
    enabled: !!id,
  });

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof purchaseService.updatePurchase>[1] }) =>
      purchaseService.updatePurchase(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
};

export const useOrderPurchasesList = (params?: OrderPurchaseListParams) =>
  useQuery({
    queryKey: orderPurchaseKeys.list(params),
    queryFn: () => orderPurchaseService.getOrderPurchases(params).then((res) => res.data),
  });

export const useOrderPurchaseDetail = (id: number) =>
  useQuery({
    queryKey: orderPurchaseKeys.detail(id),
    queryFn: () => orderPurchaseService.getOrderPurchase(id).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateOrderPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderPurchaseService.createOrderPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderPurchaseKeys.all });
    },
  });
};

export const useUpdateOrderPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof orderPurchaseService.updateOrderPurchase>[1];
    }) => orderPurchaseService.updateOrderPurchase(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderPurchaseKeys.all });
      queryClient.invalidateQueries({ queryKey: orderPurchaseKeys.detail(id) });
    },
  });
};

export const useDeleteOrderPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderPurchaseService.deleteOrderPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderPurchaseKeys.all });
    },
  });
};

export const useSupplierOptions = () =>
  useQuery({
    queryKey: purchasingLookupKeys.suppliers,
    queryFn: () => purchasingLookupService.getSupplierOptions().then((res) => res.data),
  });

export const useFuelOptions = () =>
  useQuery({
    queryKey: purchasingLookupKeys.fuels,
    queryFn: () => purchasingLookupService.getFuelOptions().then((res) => res.data),
  });

export const usePartnerOptions = () =>
  useQuery({
    queryKey: purchasingLookupKeys.partners,
    queryFn: () => purchasingLookupService.getPartnerOptions().then((res) => res.data),
  });

export const useCurrencyOptions = () =>
  useQuery({
    queryKey: purchasingLookupKeys.currencies,
    queryFn: () => purchasingLookupService.getCurrencyOptions().then((res) => res.data),
  });

export const useCurrencyRates = () =>
  useQuery({
    queryKey: purchasingLookupKeys.currencyRates,
    queryFn: () => purchasingLookupService.getCurrencyRates().then((res) => res.data),
  });

export const useTankOptions = () =>
  useQuery({
    queryKey: purchasingLookupKeys.tanks,
    queryFn: () => purchasingLookupService.getTankOptions().then((res) => res.data),
  });
