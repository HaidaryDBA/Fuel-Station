import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Fuel } from '../types/inventory';

interface FuelTableProps {
  fuels: Fuel[];
  loading?: boolean;
  onView: (fuel: Fuel) => void;
  onEdit: (fuel: Fuel) => void;
  onDelete: (fuel: Fuel) => void;
}

export default function FuelTable({ fuels, loading, onView, onEdit, onDelete }: FuelTableProps) {
  const { t } = useTranslation();

  const columns: Column<Fuel>[] = [
    {
      key: 'fuel_name',
      label: t('inventory.fuelName'),
      header: t('inventory.fuelName'),
      render: (fuel) => (
        <div className="font-medium text-text-primary">{fuel.fuel_name}</div>
      ),
    },
    {
      key: 'type',
      label: t('inventory.type'),
      header: t('inventory.type'),
      render: (fuel) => fuel.type || '-',
    },
    {
      key: 'actions',
      label: t('inventory.actions'),
      header: t('inventory.actions'),
      render: (fuel) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(fuel)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(fuel)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(fuel)}>
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
        data={fuels}
        loading={loading}
        pagination={false}
        emptyMessage={t('inventory.noFuelsFound')}
        getRowKey={(fuel) => fuel.id}
      />
    </Card>
  );
}
