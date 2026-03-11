import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { FuelMotor } from '../types/inventory';

interface MotorTableProps {
  motors: FuelMotor[];
  loading?: boolean;
  onView: (motor: FuelMotor) => void;
  onEdit: (motor: FuelMotor) => void;
  onDelete: (motor: FuelMotor) => void;
}

export default function MotorTable({ motors, loading, onView, onEdit, onDelete }: MotorTableProps) {
  const { t } = useTranslation();

  const columns: Column<FuelMotor>[] = [
    {
      key: 'motor_name',
      label: t('inventory.motorName'),
      header: t('inventory.motorName'),
      render: (motor) => (
        <div className="font-medium text-text-primary">{motor.motor_name}</div>
      ),
    },
    {
      key: 'tank_name',
      label: t('inventory.tank'),
      header: t('inventory.tank'),
      render: (motor) => motor.tank_name || '-',
    },
    {
      key: 'fuel_name',
      label: t('inventory.fuel'),
      header: t('inventory.fuel'),
      render: (motor) => motor.fuel_name || '-',
    },
    {
      key: 'actions',
      label: t('inventory.actions'),
      header: t('inventory.actions'),
      render: (motor) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(motor)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(motor)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(motor)}>
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
        data={motors}
        loading={loading}
        pagination={false}
        emptyMessage={t('inventory.noMotorsFound')}
        getRowKey={(motor) => motor.id}
      />
    </Card>
  );
}
