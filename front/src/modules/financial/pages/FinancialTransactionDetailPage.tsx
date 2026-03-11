import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import FinancialTransactionDetailCard from '../components/FinancialTransactionDetailCard';
import {
  useDeleteFinancialTransaction,
  useFinancialTransactionDetail,
} from '../queries/useFinancialQueries';

export default function FinancialTransactionDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const transactionId = Number(id);
  const { data: transaction, isLoading, isError } = useFinancialTransactionDetail(
    transactionId,
    Number.isFinite(transactionId)
  );
  const deleteTransactionMutation = useDeleteFinancialTransaction();

  const handleDelete = async () => {
    if (!transaction) {
      return;
    }

    const confirmed = window.confirm(
      t('financial.deleteTransactionConfirm', 'Delete this financial transaction?')
    );
    if (!confirmed) {
      return;
    }

    await deleteTransactionMutation.mutateAsync(transaction.id);
    navigate('/finance/transactions');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('financial.loadingTransactionDetails', 'Loading transaction details...')}</CardContent>
      </Card>
    );
  }

  if (isError || !transaction) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">
            {t('financial.failedToLoadTransactionDetails', 'Failed to load transaction details')}
          </p>
          <Button variant="outline" onClick={() => navigate('/finance/transactions')}>
            {t('financial.backToTransactions', 'Back to transactions')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.transactionDetails', 'Transaction Details')}
        subtitle={t(
          'financial.transactionDetailsSubtitle',
          'Review the selected finance transaction and its related account movement.'
        )}
        actions={[
          {
            label: t('financial.back', 'Back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/transactions'),
          },
          {
            label: t('financial.edit', 'Edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/finance/transactions/${transaction.id}/edit`),
          },
        ]}
      />

      <FinancialTransactionDetailCard
        transaction={transaction}
        onBack={() => navigate('/finance/transactions')}
        onEdit={() => navigate(`/finance/transactions/${transaction.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteTransactionMutation.isPending}
      />
    </div>
  );
}
