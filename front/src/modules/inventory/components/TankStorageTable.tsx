import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { TankStorage } from '../types/inventory';

interface TankStorageTableProps {
  tanks: TankStorage[];
  loading?: boolean;
  onView: (tank: TankStorage) => void;
  onEdit: (tank: TankStorage) => void;
  onDelete: (tank: TankStorage) => void;
}

export default function TankStorageTable({ tanks, loading, onView, onEdit, onDelete }: TankStorageTableProps) {
  const { t } = useTranslation();

  const columns: Column<TankStorage>[] = [
    {
      key: 'tank_number',
      label: t('inventory.tankNumber'),
      header: t('inventory.tankNumber'),
      render: (tank) => tank.tank_number,
    },
    {
      key: 'fuel_name',
      label: t('inventory.fuelName'),
      header: t('inventory.fuelName'),
      render: (tank) => tank.fuel_name || '-',
    },
    {
      key: 'capacity',
      label: t('inventory.capacity'),
      header: t('inventory.capacity'),
      render: (tank) => tank.capacity,
    },
    {
      key: 'min_level_alert',
      label: t('inventory.minLevelAlert'),
      header: t('inventory.minLevelAlert'),
      render: (tank) => tank.min_level_alert,
    },
    {
      key: 'actions',
      label: t('inventory.actions'),
      header: t('inventory.actions'),
      render: (tank) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(tank)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(tank)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(tank)}>
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
        data={tanks}
        loading={loading}
        pagination={false}
        emptyMessage={t('inventory.noTanksFound')}
        getRowKey={(tank) => tank.id}
      />
    </Card>
  );
}
