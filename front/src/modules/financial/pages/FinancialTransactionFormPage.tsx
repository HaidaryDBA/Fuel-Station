import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import FinancialTransactionForm from '../components/FinancialTransactionForm';
import {
  useAccountsList,
  useCreateFinancialTransaction,
  useCurrenciesList,
  useFinancialTransactionDetail,
  useUpdateFinancialTransaction,
} from '../queries/useFinancialQueries';
import type { FinancialTransactionFormValues } from '../types/financial';

export default function FinancialTransactionFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: transaction, isLoading: isLoadingTransaction, isError } = useFinancialTransactionDetail(
    parsedId,
    isEditMode
  );
  const { data: accountData } = useAccountsList({ page_size: 300, is_active: true });
  const { data: currencyData } = useCurrenciesList();
  const createTransactionMutation = useCreateFinancialTransaction();
  const updateTransactionMutation = useUpdateFinancialTransaction(parsedId);

  const initialValues: Partial<FinancialTransactionFormValues> | undefined = transaction
    ? {
        from_account: transaction.from_account ?? 0,
        to_account: transaction.to_account ?? 0,
        transaction_type: transaction.transaction_type,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date_time: transaction.date_time,
        reference_type: transaction.reference_type ?? '',
        reference_id: transaction.reference_id,
        description: transaction.description,
      }
    : undefined;

  const handleSubmit = async (values: FinancialTransactionFormValues) => {
    try {
      if (isEditMode) {
        await updateTransactionMutation.mutateAsync(values);
        toast.success(t('financial.transactionUpdated', 'Financial transaction updated'));
        navigate(`/finance/transactions/${parsedId}`);
        return;
      }

      const createdTransaction = await createTransactionMutation.mutateAsync(values);
      toast.success(t('financial.transactionCreated', 'Financial transaction created'));
      navigate(`/finance/transactions/${createdTransaction.id}`);
    } catch {
      toast.error(t('financial.transactionSaveFailed', 'Failed to save financial transaction'));
    }
  };

  if (isEditMode && isLoadingTransaction) {
    return (
      <Card>
        <CardContent>{t('financial.loadingTransactionForm', 'Loading transaction form...')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !transaction)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">
            {t('financial.transactionNotFound', 'Financial transaction not found')}
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
        title={
          isEditMode
            ? t('financial.editTransaction', 'Edit Financial Transaction')
            : t('financial.addTransaction', 'Add Financial Transaction')
        }
        subtitle={
          isEditMode
            ? t(
                'financial.editTransactionSubtitle',
                'Update the transaction details and keep account movements consistent.'
              )
            : t(
                'financial.addTransactionSubtitle',
                'Create a deposit, withdrawal, or transfer inside the finance module.'
              )
        }
        actions={[
          {
            label: t('financial.back', 'Back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/transactions'),
          },
        ]}
      />

      <FinancialTransactionForm
        initialValues={initialValues}
        transaction={transaction}
        accounts={accountData?.results ?? []}
        currencies={currencyData?.results ?? []}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/transactions')}
        isSubmitting={createTransactionMutation.isPending || updateTransactionMutation.isPending}
        submitLabel={isEditMode ? t('financial.update', 'Update') : t('financial.create', 'Create')}
      />
    </div>
  );
}
