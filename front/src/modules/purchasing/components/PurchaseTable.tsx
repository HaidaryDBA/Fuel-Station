import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Purchase } from '../types/purchasing';

interface PurchaseTableProps {
  purchases: Purchase[];
  loading?: boolean;
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}

export default function PurchaseTable({
  purchases,
  loading,
  onView,
  onEdit,
  onDelete,
}: PurchaseTableProps) {
  const { t } = useTranslation();

  const columns: Column<Purchase>[] = [
    {
      key: 'invoice_number',
      label: t('purchasing.invoiceNumber', 'Invoice'),
      header: t('purchasing.invoiceNumber', 'Invoice'),
      render: (purchase) => purchase.invoice_number || `#${purchase.purchase_id}`,
    },
    {
      key: 'supplier_name',
      label: t('purchasing.supplier', 'Supplier'),
      header: t('purchasing.supplier', 'Supplier'),
      render: (purchase) => <div className="font-medium text-text-primary">{purchase.supplier_name}</div>,
    },
    {
      key: 'fuel_name',
      label: t('purchasing.fuel', 'Fuel'),
      header: t('purchasing.fuel', 'Fuel'),
      render: (purchase) => purchase.fuel_name,
    },
    {
      key: 'total_amount',
      label: t('purchasing.totalAmount', 'Total Amount'),
      header: t('purchasing.totalAmount', 'Total Amount'),
      render: (purchase) => (
        <div>
          <div>{purchase.total_amount} {purchase.currency_code}</div>
          <div className="text-xs text-text-secondary">
            {purchase.total_amount_in_base_currency} {purchase.base_currency_code}
          </div>
        </div>
      ),
    },
    {
      key: 'paid_amount',
      label: t('purchasing.paidAmount', 'Paid Amount'),
      header: t('purchasing.paidAmount', 'Paid Amount'),
      render: (purchase) => (
        <div>
          <div>{purchase.paid_amount} {purchase.paid_currency_code}</div>
          <div className="text-xs text-text-secondary">
            {purchase.paid_amount_in_purchase_currency} {purchase.currency_code}
          </div>
        </div>
      ),
    },
    {
      key: 'remaining_amount',
      label: t('purchasing.remainingAmount', 'Remaining Amount'),
      header: t('purchasing.remainingAmount', 'Remaining Amount'),
      render: (purchase) => (
        <Badge variant={purchase.payment_status === 'completed' ? 'success' : 'warning'} dot>
          {purchase.remaining_amount} {purchase.currency_code}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('purchasing.actions', 'Actions'),
      header: t('purchasing.actions', 'Actions'),
      render: (purchase) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(purchase)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(purchase)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(purchase)}>
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
        data={purchases}
        loading={loading}
        pagination={false}
        emptyMessage={t('purchasing.noPurchasesFound', 'No purchases found')}
        getRowKey={(purchase) => purchase.id}
      />
    </Card>
  );
}
