import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components';

import TransactionDetailCard from '../components/TransactionDetailCard';
import { useDeleteTransaction, useTransactionDetail } from '../queries/useInventoryQueries';
import type { InventoryTransaction } from '../types/inventory';

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: transaction, isLoading } = useTransactionDetail(Number(id));
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (transactionData: InventoryTransaction) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: `Transaction #${transactionData.id}` }));
    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync(transactionData.id);
      toast.success(t('inventory.transactionDeleted'));
      navigate('/fuel/transactions');
    } catch {
      toast.error(t('inventory.transactionDeleteFailed'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Transaction #${transaction.id}`}
        subtitle={transaction.fuel_name || `Fuel #${transaction.fuel_id}`}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: () => navigate('/fuel/transactions'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/fuel/transactions/${transaction.id}/edit`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger' as const,
            onClick: () => handleDelete(transaction),
          },
        ]}
      />

      <TransactionDetailCard transaction={transaction} />
    </div>
  );
}
