import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import ExpenseDetailCard from '../components/ExpenseDetailCard';
import { useDeleteExpense, useExpenseDetail } from '../queries/useFinancialQueries';

export default function ExpenseDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const expenseId = Number(id);
  const { data: expense, isLoading, isError } = useExpenseDetail(expenseId, Number.isFinite(expenseId));
  const deleteExpenseMutation = useDeleteExpense();

  const handleDelete = async () => {
    if (!expense) {
      return;
    }

    const confirmed = window.confirm(t('financial.deleteExpenseConfirm', { name: expense.title }));
    if (!confirmed) {
      return;
    }

    await deleteExpenseMutation.mutateAsync(expense.id);
    navigate('/finance/expenses');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('financial.loadingExpenseDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !expense) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.failedToLoadExpenseDetails')}</p>
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
        title={t('financial.expenseDetails')}
        subtitle={t('financial.expenseDetailSubtitle')}
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/expenses'),
          },
          {
            label: t('financial.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/finance/expenses/${expense.id}/edit`),
          },
        ]}
      />

      <ExpenseDetailCard
        expense={expense}
        onBack={() => navigate('/finance/expenses')}
        onEdit={() => navigate(`/finance/expenses/${expense.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteExpenseMutation.isPending}
      />
    </div>
  );
}
