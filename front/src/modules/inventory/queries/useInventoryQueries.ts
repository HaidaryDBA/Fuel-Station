import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fuelService,
  tankStorageService,
  fuelMotorService,
  priceHistoryService,
  inventoryTransactionService,
} from '../services/inventoryService';

import {
  fuelKeys,
  tankStorageKeys,
  fuelMotorKeys,
  priceHistoryKeys,
  inventoryTransactionKeys,
} from './inventoryKeys';

import type { InventoryListParams } from '../types/inventory';

// ============= Fuel Queries =============
export const useFuelsList = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: fuelKeys.list(params),
    queryFn: () => fuelService.getFuels(params).then((res) => res.data),
  });
};

export const useFuelDetail = (id: number) => {
  return useQuery({
    queryKey: fuelKeys.detail(id),
    queryFn: () => fuelService.getFuel(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateFuel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fuelService.createFuel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
    },
  });
};

export const useUpdateFuel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof fuelService.updateFuel>[1] }) =>
      fuelService.updateFuel(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
      queryClient.invalidateQueries({ queryKey: fuelKeys.detail(id) });
    },
  });
};

export const useDeleteFuel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fuelService.deleteFuel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
    },
  });
};

// ============= Tank Storage Queries =============
export const useTankStoragesList = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: tankStorageKeys.list(params),
    queryFn: () => tankStorageService.getTankStorages(params).then((res) => res.data),
  });
};

export const useTankStorageDetail = (id: number) => {
  return useQuery({
    queryKey: tankStorageKeys.detail(id),
    queryFn: () => tankStorageService.getTankStorage(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateTankStorage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tankStorageService.createTankStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tankStorageKeys.all });
    },
  });
};

export const useUpdateTankStorage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof tankStorageService.updateTankStorage>[1] }) =>
      tankStorageService.updateTankStorage(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tankStorageKeys.all });
      queryClient.invalidateQueries({ queryKey: tankStorageKeys.detail(id) });
    },
  });
};

export const useDeleteTankStorage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tankStorageService.deleteTankStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tankStorageKeys.all });
    },
  });
};

// ============= Fuel Motor Queries =============
export const useFuelMotorsList = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: fuelMotorKeys.list(params),
    queryFn: () => fuelMotorService.getFuelMotors(params).then((res) => res.data),
  });
};

export const useFuelMotorDetail = (id: number) => {
  return useQuery({
    queryKey: fuelMotorKeys.detail(id),
    queryFn: () => fuelMotorService.getFuelMotor(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateFuelMotor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fuelMotorService.createFuelMotor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelMotorKeys.all });
    },
  });
};

export const useUpdateFuelMotor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof fuelMotorService.updateFuelMotor>[1] }) =>
      fuelMotorService.updateFuelMotor(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fuelMotorKeys.all });
      queryClient.invalidateQueries({ queryKey: fuelMotorKeys.detail(id) });
    },
  });
};

export const useDeleteFuelMotor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fuelMotorService.deleteFuelMotor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelMotorKeys.all });
    },
  });
};

// ============= Price History Queries =============
export const usePriceHistoriesList = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: priceHistoryKeys.list(params),
    queryFn: () => priceHistoryService.getPriceHistories(params).then((res) => res.data),
  });
};

export const usePriceHistoryDetail = (id: number) => {
  return useQuery({
    queryKey: priceHistoryKeys.detail(id),
    queryFn: () => priceHistoryService.getPriceHistory(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreatePriceHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: priceHistoryService.createPriceHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceHistoryKeys.all });
    },
  });
};

export const useUpdatePriceHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof priceHistoryService.updatePriceHistory>[1] }) =>
      priceHistoryService.updatePriceHistory(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: priceHistoryKeys.all });
      queryClient.invalidateQueries({ queryKey: priceHistoryKeys.detail(id) });
    },
  });
};

export const useDeletePriceHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: priceHistoryService.deletePriceHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceHistoryKeys.all });
    },
  });
};

// ============= Inventory Transaction Queries =============
export const useTransactionsList = (params?: InventoryListParams) => {
  return useQuery({
    queryKey: inventoryTransactionKeys.list(params),
    queryFn: () => inventoryTransactionService.getTransactions(params).then((res) => res.data),
  });
};

export const useTransactionDetail = (id: number) => {
  return useQuery({
    queryKey: inventoryTransactionKeys.detail(id),
    queryFn: () => inventoryTransactionService.getTransaction(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryTransactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryTransactionKeys.all });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof inventoryTransactionService.updateTransaction>[1] }) =>
      inventoryTransactionService.updateTransaction(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: inventoryTransactionKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryTransactionKeys.detail(id) });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryTransactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryTransactionKeys.all });
    },
  });
};
