import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';
import { formatLocalDateTime } from '@/utils/formatLocalDateTime';
import { truncateText } from '@/utils/truncateText';

import {
  getFinancialTransactionReferenceLabel,
  getFinancialTransactionTypeLabel,
} from '../constants/financialTransactionOptions';
import type { FinancialTransaction } from '../types/financial';

interface FinancialTransactionTableProps {
  transactions: FinancialTransaction[];
  loading?: boolean;
  onView: (transaction: FinancialTransaction) => void;
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (transaction: FinancialTransaction) => void;
}

const getTransactionBadgeVariant = (type: FinancialTransaction['transaction_type']) => {
  if (type === 'deposit') {
    return 'success';
  }
  if (type === 'withdraw') {
    return 'warning';
  }
  return 'info';
};

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

const getAccountLabel = (transaction: FinancialTransaction) => {
  if (transaction.transaction_type === 'deposit') {
    return transaction.to_account_name || '-';
  }
  if (transaction.transaction_type === 'withdraw') {
    return transaction.from_account_name || '-';
  }
  return `${transaction.from_account_name || '-'} -> ${transaction.to_account_name || '-'}`;
};

export default function FinancialTransactionTable({
  transactions,
  loading,
  onView,
  onEdit,
  onDelete,
}: FinancialTransactionTableProps) {
  const { t } = useTranslation();

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'date_time',
      label: t('financial.dateTime', 'Date & Time'),
      header: t('financial.dateTime', 'Date & Time'),
      sortable: true,
      render: (transaction) => formatLocalDateTime(transaction.date_time),
    },
    {
      key: 'transaction_type',
      label: t('financial.transactionType', 'Transaction Type'),
      header: t('financial.transactionType', 'Transaction Type'),
      sortable: true,
      render: (transaction) => (
        <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)} size="sm">
          {getFinancialTransactionTypeLabel(transaction.transaction_type, t)}
        </Badge>
      ),
    },
    {
      key: 'account',
      label: t('financial.account', 'Account'),
      header: t('financial.account', 'Account'),
      render: (transaction) => getAccountLabel(transaction),
    },
    {
      key: 'amount',
      label: t('financial.amount', 'Amount'),
      header: t('financial.amount', 'Amount'),
      sortable: true,
      render: (transaction) => `${formatAmount(transaction.amount)} ${transaction.currency_code}`,
    },
    {
      key: 'reference_type',
      label: t('financial.reference', 'Reference'),
      header: t('financial.reference', 'Reference'),
      render: (transaction) => {
        if (!transaction.reference_type) {
          return '-';
        }
        const referenceId = transaction.reference_id ? ` #${transaction.reference_id}` : '';
        return `${getFinancialTransactionReferenceLabel(transaction.reference_type, t)}${referenceId}`;
      },
    },
    {
      key: 'description',
      label: t('financial.description', 'Description'),
      header: t('financial.description', 'Description'),
      render: (transaction) => {
        const description = transaction.description.trim();
        if (!description) {
          return '-';
        }
        return <span title={description}>{truncateText(description, 60)}</span>;
      },
    },
    {
      key: 'actions',
      label: t('financial.actions', 'Actions'),
      header: t('financial.actions', 'Actions'),
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(transaction)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(transaction)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(transaction)}>
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
        data={transactions}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noTransactionsFound', 'No financial transactions found')}
        getRowKey={(transaction) => transaction.id}
      />
    </Card>
  );
}
