import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Expense } from '../types/financial';

interface ExpenseDetailCardProps {
  expense: Expense;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function ExpenseDetailCard({
  expense,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: ExpenseDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={expense.title}
        subtitle={`${formatAmount(expense.amount)} ${expense.currency_code}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('financial.back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('financial.edit')}
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              {t('financial.delete')}
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label={t('financial.title')} value={expense.title} />
          <DetailItem
            label={t('financial.amount')}
            value={`${formatAmount(expense.amount)} ${expense.currency_code}`}
          />
          <DetailItem
            label={t('financial.currencyRate', 'Currency Rate')}
            value={expense.currency_rate}
          />
          <DetailItem
            label={t('financial.amountInBaseCurrency', 'Amount In Base Currency')}
            value={formatAmount(expense.amount_in_base_currency)}
          />
          <DetailItem label={t('financial.payDate')} value={new Date(expense.pay_date).toLocaleDateString()} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('financial.description')}</p>
          <p className="text-sm text-text-secondary">{expense.description || '-'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-sm text-text-primary">{value}</div>
    </div>
  );
}
