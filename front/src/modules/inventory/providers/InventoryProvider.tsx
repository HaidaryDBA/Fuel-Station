import { createContext, useContext, type ReactNode } from 'react';

import {
  useFuelsList,
  useFuelDetail,
  useCreateFuel,
  useUpdateFuel,
  useDeleteFuel,
  useTankStoragesList,
  useTankStorageDetail,
  useCreateTankStorage,
  useUpdateTankStorage,
  useDeleteTankStorage,
  useFuelMotorsList,
  useFuelMotorDetail,
  useCreateFuelMotor,
  useUpdateFuelMotor,
  useDeleteFuelMotor,
  usePriceHistoriesList,
  usePriceHistoryDetail,
  useCreatePriceHistory,
  useUpdatePriceHistory,
  useDeletePriceHistory,
  useTransactionsList,
  useTransactionDetail,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../queries/useInventoryQueries';

import type { InventoryListParams } from '../types/inventory';

interface InventoryContextValue {
  // Fuel
  useFuelsList: (params?: InventoryListParams) => ReturnType<typeof useFuelsList>;
  useFuelDetail: (id: number) => ReturnType<typeof useFuelDetail>;
  useCreateFuel: typeof useCreateFuel;
  useUpdateFuel: typeof useUpdateFuel;
  useDeleteFuel: typeof useDeleteFuel;

  // Tank Storage
  useTankStoragesList: (params?: InventoryListParams) => ReturnType<typeof useTankStoragesList>;
  useTankStorageDetail: (id: number) => ReturnType<typeof useTankStorageDetail>;
  useCreateTankStorage: typeof useCreateTankStorage;
  useUpdateTankStorage: typeof useUpdateTankStorage;
  useDeleteTankStorage: typeof useDeleteTankStorage;

  // Fuel Motor
  useFuelMotorsList: (params?: InventoryListParams) => ReturnType<typeof useFuelMotorsList>;
  useFuelMotorDetail: (id: number) => ReturnType<typeof useFuelMotorDetail>;
  useCreateFuelMotor: typeof useCreateFuelMotor;
  useUpdateFuelMotor: typeof useUpdateFuelMotor;
  useDeleteFuelMotor: typeof useDeleteFuelMotor;

  // Price History
  usePriceHistoriesList: (params?: InventoryListParams) => ReturnType<typeof usePriceHistoriesList>;
  usePriceHistoryDetail: (id: number) => ReturnType<typeof usePriceHistoryDetail>;
  useCreatePriceHistory: typeof useCreatePriceHistory;
  useUpdatePriceHistory: typeof useUpdatePriceHistory;
  useDeletePriceHistory: typeof useDeletePriceHistory;

  // Inventory Transaction
  useTransactionsList: (params?: InventoryListParams) => ReturnType<typeof useTransactionsList>;
  useTransactionDetail: (id: number) => ReturnType<typeof useTransactionDetail>;
  useCreateTransaction: typeof useCreateTransaction;
  useUpdateTransaction: typeof useUpdateTransaction;
  useDeleteTransaction: typeof useDeleteTransaction;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

interface InventoryProviderProps {
  children: ReactNode;
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const value: InventoryContextValue = {
    // Fuel
    useFuelsList,
    useFuelDetail,
    useCreateFuel,
    useUpdateFuel,
    useDeleteFuel,

    // Tank Storage
    useTankStoragesList,
    useTankStorageDetail,
    useCreateTankStorage,
    useUpdateTankStorage,
    useDeleteTankStorage,

    // Fuel Motor
    useFuelMotorsList,
    useFuelMotorDetail,
    useCreateFuelMotor,
    useUpdateFuelMotor,
    useDeleteFuelMotor,

    // Price History
    usePriceHistoriesList,
    usePriceHistoryDetail,
    useCreatePriceHistory,
    useUpdatePriceHistory,
    useDeletePriceHistory,

    // Inventory Transaction
    useTransactionsList,
    useTransactionDetail,
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

export default InventoryProvider;
