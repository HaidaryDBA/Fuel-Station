import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { OrderPurchase } from '../types/purchasing';

interface OrderPurchaseTableProps {
  orderPurchases: OrderPurchase[];
  loading?: boolean;
  onView: (orderPurchase: OrderPurchase) => void;
  onEdit: (orderPurchase: OrderPurchase) => void;
  onDelete: (orderPurchase: OrderPurchase) => void;
}

export default function OrderPurchaseTable({
  orderPurchases,
  loading,
  onView,
  onEdit,
  onDelete,
}: OrderPurchaseTableProps) {
  const { t } = useTranslation();

  const columns: Column<OrderPurchase>[] = [
    {
      key: 'order_id',
      label: t('purchasing.orderId', 'Order ID'),
      header: t('purchasing.orderId', 'Order ID'),
      render: (orderPurchase) => <div className="font-medium text-text-primary">#{orderPurchase.order_id}</div>,
    },
    {
      key: 'supplier_name',
      label: t('purchasing.supplier', 'Supplier'),
      header: t('purchasing.supplier', 'Supplier'),
      render: (orderPurchase) => orderPurchase.supplier_name,
    },
    {
      key: 'tanker_name',
      label: t('purchasing.tanker', 'Tanker'),
      header: t('purchasing.tanker', 'Tanker'),
      render: (orderPurchase) => orderPurchase.tanker_name,
    },
    {
      key: 'estimated_total_cost',
      label: t('purchasing.estimatedTotalCost', 'Estimated Total Cost'),
      header: t('purchasing.estimatedTotalCost', 'Estimated Total Cost'),
      render: (orderPurchase) => `${orderPurchase.estimated_total_cost} ${orderPurchase.currency_code}`,
    },
    {
      key: 'currency_cost',
      label: t('purchasing.currencyCost', 'Currency Cost'),
      header: t('purchasing.currencyCost', 'Currency Cost'),
      render: (orderPurchase) => `${orderPurchase.currency_cost} ${orderPurchase.base_currency_code}`,
    },
    {
      key: 'actions',
      label: t('purchasing.actions', 'Actions'),
      header: t('purchasing.actions', 'Actions'),
      render: (orderPurchase) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(orderPurchase)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(orderPurchase)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(orderPurchase)}>
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
        data={orderPurchases}
        loading={loading}
        pagination={false}
        emptyMessage={t('purchasing.noOrderPurchasesFound', 'No order purchases found')}
        getRowKey={(orderPurchase) => orderPurchase.id}
      />
    </Card>
  );
}
