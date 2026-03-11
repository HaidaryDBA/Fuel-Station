import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import ExpenseForm from '../components/ExpenseForm';
import {
  useCreateExpense,
  useCurrenciesList,
  useExpenseDetail,
  useUpdateExpense,
} from '../queries/useFinancialQueries';
import type { ExpenseFormValues } from '../types/financial';

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: expense, isLoading: isLoadingExpense, isError } = useExpenseDetail(parsedId, isEditMode);
  const { data: currencyData } = useCurrenciesList();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense(parsedId);

  const initialValues: Partial<ExpenseFormValues> | undefined = expense
    ? {
        title: expense.title,
        amount: Number(expense.amount),
        currency: expense.currency,
        pay_date: expense.pay_date,
        description: expense.description,
      }
    : undefined;

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      if (isEditMode) {
        await updateExpenseMutation.mutateAsync(values);
        toast.success(t('financial.expenseUpdated'));
        navigate(`/finance/expenses/${parsedId}`);
        return;
      }

      const createdExpense = await createExpenseMutation.mutateAsync(values);
      toast.success(t('financial.expenseCreated'));
      navigate(`/finance/expenses/${createdExpense.id}`);
    } catch {
      toast.error(t('financial.expenseSaveFailed'));
    }
  };

  if (isEditMode && isLoadingExpense) {
    return (
      <Card>
        <CardContent>{t('financial.loadingExpenseForm')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !expense)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.expenseNotFound')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/expenses')}>
            {t('financial.backToExpenses')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('financial.editExpense') : t('financial.addExpense')}
        subtitle={
          isEditMode ? t('financial.editExpenseSubtitle') : t('financial.addExpenseSubtitle')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/expenses'),
          },
        ]}
      />

      <ExpenseForm
        initialValues={initialValues}
        currencies={currencyData?.results ?? []}
        currencyRate={expense?.currency_rate}
        amountInBaseCurrency={expense?.amount_in_base_currency}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/expenses')}
        isSubmitting={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
