import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { PriceHistory } from '../types/inventory';

interface PriceTableProps {
  prices: PriceHistory[];
  loading?: boolean;
  onView: (price: PriceHistory) => void;
  onEdit: (price: PriceHistory) => void;
  onDelete: (price: PriceHistory) => void;
}

export default function PriceTable({ prices, loading, onView, onEdit, onDelete }: PriceTableProps) {
  const { t } = useTranslation();

  const columns: Column<PriceHistory>[] = [
    {
      key: 'fuel_name',
      label: t('inventory.fuel'),
      header: t('inventory.fuel'),
      render: (price) => (
        <div className="font-medium text-text-primary">{price.fuel_name || '-'}</div>
      ),
    },
    {
      key: 'price',
      label: t('inventory.price'),
      header: t('inventory.price'),
      render: (price) => price.price || '-',
    },
    {
      key: 'start_date',
      label: t('inventory.startDate'),
      header: t('inventory.startDate'),
      render: (price) => price.start_date || '-',
    },
    {
      key: 'end_date',
      label: t('inventory.endDate'),
      header: t('inventory.endDate'),
      render: (price) => price.end_date || '-',
    },
    {
      key: 'actions',
      label: t('inventory.actions'),
      header: t('inventory.actions'),
      render: (price) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(price)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(price)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(price)}>
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
        data={prices}
        loading={loading}
        pagination={false}
        emptyMessage={t('inventory.noPricesFound')}
        getRowKey={(price) => price.id}
      />
    </Card>
  );
}
