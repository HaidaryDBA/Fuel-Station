import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';
import { truncateText } from '@/utils/truncateText';

import type { Expense } from '../types/financial';

interface ExpenseTableProps {
  expenses: Expense[];
  loading?: boolean;
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function ExpenseTable({ expenses, loading, onView, onEdit, onDelete }: ExpenseTableProps) {
  const { t } = useTranslation();

  const columns: Column<Expense>[] = [
    {
      key: 'title',
      label: t('financial.title'),
      header: t('financial.title'),
      render: (expense) => expense.title,
    },
    {
      key: 'amount',
      label: t('financial.amount'),
      header: t('financial.amount'),
      sortable: true,
      render: (expense) => `${formatAmount(expense.amount)} ${expense.currency_code}`,
    },
    {
      key: 'currency_rate',
      label: t('financial.currencyRate', 'Currency Rate'),
      header: t('financial.currencyRate', 'Currency Rate'),
      sortable: true,
      render: (expense) => expense.currency_rate,
    },
    {
      key: 'amount_in_base_currency',
      label: t('financial.amountInBaseCurrency', 'Amount In Base Currency'),
      header: t('financial.amountInBaseCurrency', 'Amount In Base Currency'),
      sortable: true,
      render: (expense) => formatAmount(expense.amount_in_base_currency),
    },
    {
      key: 'pay_date',
      label: t('financial.payDate'),
      header: t('financial.payDate'),
      sortable: true,
      render: (expense) => new Date(expense.pay_date).toLocaleDateString(),
    },
    {
      key: 'description',
      label: t('financial.description'),
      header: t('financial.description'),
      render: (expense) => {
        const description = (expense.description || '').trim();
        if (!description) {
          return '-';
        }
        return <span title={description}>{truncateText(description, 50)}</span>;
      },
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (expense) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(expense)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(expense)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noExpensesFound')}
        getRowKey={(expense) => expense.id}
      />
    </Card>
  );
}
