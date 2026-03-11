import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { InventoryTransaction } from '../types/inventory';

interface TransactionTableProps {
  transactions: InventoryTransaction[];
  loading?: boolean;
  onView: (transaction: InventoryTransaction) => void;
  onEdit: (transaction: InventoryTransaction) => void;
  onDelete: (transaction: InventoryTransaction) => void;
}

const getTransactionTypeBadge = (type: string, t: (key: string) => string) => {
  const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    purchase_in: 'success',
    sale_out: 'info',
    lending_out: 'warning',
    return_in: 'success',
    adjustment: 'default',
  };
  
  return (
    <Badge variant={variants[type] || 'default'} size="sm">
      {t(`inventory.${type.replace('_', '')}`)}
    </Badge>
  );
};

export default function TransactionTable({ transactions, loading, onView, onEdit, onDelete }: TransactionTableProps) {
  const { t } = useTranslation();

  const columns: Column<InventoryTransaction>[] = [
    {
      key: 'date_time',
      label: t('inventory.dateTime'),
      header: t('inventory.dateTime'),
      sortable: true,
      render: (transaction) => new Date(transaction.date_time).toLocaleString(),
    },
    {
      key: 'tank_name',
      label: t('inventory.tankNumber'),
      header: t('inventory.tankNumber'),
      render: (transaction) => transaction.tank_name || '-',
    },
    {
      key: 'fuel_name',
      label: t('inventory.fuelName'),
      header: t('inventory.fuelName'),
      render: (transaction) => transaction.fuel_name || '-',
    },
    {
      key: 'transaction_type',
      label: t('inventory.transactionType'),
      header: t('inventory.transactionType'),
      render: (transaction) => getTransactionTypeBadge(transaction.transaction_type, t),
    },
    {
      key: 'quantity',
      label: t('inventory.quantity'),
      header: t('inventory.quantity'),
      render: (transaction) => transaction.quantity,
    },
    {
      key: 'actions',
      label: t('inventory.actions'),
      header: t('inventory.actions'),
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
        emptyMessage={t('inventory.noTransactionsFound')}
        getRowKey={(transaction) => transaction.id}
      />
    </Card>
  );
}
