import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { extractAxiosError } from '@/utils/extractError';

import TransactionForm from '../components/TransactionForm';
import {
  useCreateTransaction,
  useFuelsList,
  useTankStoragesList,
  useTransactionDetail,
  useUpdateTransaction,
} from '../queries/useInventoryQueries';
import type { InventoryTransactionFormValues } from '../types/inventory';

export default function TransactionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: transaction, isLoading: isLoadingTransaction } = useTransactionDetail(Number(id));
  const { data: tanksData } = useTankStoragesList({ page_size: 100 });
  const { data: fuelsData } = useFuelsList({ page_size: 100 });
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isLoading = createTransaction.isPending || updateTransaction.isPending;

  const handleSubmit = async (data: InventoryTransactionFormValues) => {
    try {
      if (isEdit && id) {
        await updateTransaction.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('inventory.transactionUpdated'));
      } else {
        await createTransaction.mutateAsync(data);
        toast.success(t('inventory.transactionCreated'));
      }
      navigate('/fuel/transactions');
    } catch (error) {
      toast.error(extractAxiosError(error, t('inventory.transactionSaveFailed')));
    }
  };

  if (isEdit && isLoadingTransaction) {
    return <div>Loading...</div>;
  }

  return (
    <TransactionForm
      transaction={transaction}
      tanks={tanksData?.results ?? []}
      fuels={fuelsData?.results ?? []}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/fuel/transactions')}
      isLoading={isLoading}
    />
  );
}
