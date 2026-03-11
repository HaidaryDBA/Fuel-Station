import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { formatLocalDateTime } from '@/utils/formatLocalDateTime';

import {
  getFinancialTransactionReferenceLabel,
  getFinancialTransactionTypeLabel,
} from '../constants/financialTransactionOptions';
import type { FinancialTransaction } from '../types/financial';

interface FinancialTransactionDetailCardProps {
  transaction: FinancialTransaction;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

const getBadgeVariant = (type: FinancialTransaction['transaction_type']) => {
  if (type === 'deposit') {
    return 'success';
  }
  if (type === 'withdraw') {
    return 'warning';
  }
  return 'info';
};

const getAccountMovement = (transaction: FinancialTransaction) => {
  if (transaction.transaction_type === 'deposit') {
    return transaction.to_account_name || '-';
  }
  if (transaction.transaction_type === 'withdraw') {
    return transaction.from_account_name || '-';
  }
  return `${transaction.from_account_name || '-'} -> ${transaction.to_account_name || '-'}`;
};

export default function FinancialTransactionDetailCard({
  transaction,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: FinancialTransactionDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={t('financial.transactionDetails', 'Transaction Details')}
        subtitle={`${formatAmount(transaction.amount)} ${transaction.currency_code}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('financial.back', 'Back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('financial.edit', 'Edit')}
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              {t('financial.delete', 'Delete')}
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem
            label={t('financial.transactionType', 'Transaction Type')}
            value={
              <Badge variant={getBadgeVariant(transaction.transaction_type)} size="sm">
                {getFinancialTransactionTypeLabel(transaction.transaction_type, t)}
              </Badge>
            }
          />
          <DetailItem label={t('financial.accountFlow', 'Account Flow')} value={getAccountMovement(transaction)} />
          <DetailItem
            label={t('financial.dateTime', 'Date & Time')}
            value={formatLocalDateTime(transaction.date_time)}
          />
          <DetailItem
            label={t('financial.reference', 'Reference')}
            value={
              transaction.reference_type
                ? `${getFinancialTransactionReferenceLabel(transaction.reference_type, t)}${
                    transaction.reference_id ? ` #${transaction.reference_id}` : ''
                  }`
                : '-'
            }
          />
          <DetailItem
            label={t('financial.createdBy', 'Created By')}
            value={transaction.created_by_name || '-'}
          />
          <DetailItem
            label={t('financial.updatedBy', 'Updated By')}
            value={transaction.updated_by_name || '-'}
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">
            {t('financial.description', 'Description')}
          </p>
          <p className="text-sm text-text-secondary">{transaction.description || '-'}</p>
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
