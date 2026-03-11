import { Pencil, Trash2 } from 'lucide-react';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Lending } from '../types/sale';

interface LendingTableProps {
  lendings: Lending[];
  loading?: boolean;
  onEdit: (lending: Lending) => void;
  onDelete: (lending: Lending) => void;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

const statusVariantMap = {
  unpaid: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'error',
} as const;

export default function LendingTable({ lendings, loading, onEdit, onDelete }: LendingTableProps) {
  const columns: Column<Lending>[] = [
    {
      key: 'lending_id',
      header: 'Lending',
      label: 'Lending',
      sortable: true,
      render: (lending) => (
        <div>
          <p className="font-medium text-text-primary">#{lending.lending_id}</p>
          <p className="text-xs text-text-secondary">{new Date(lending.sale_date).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      label: 'Customer',
      render: (lending) => lending.customer_name,
    },
    {
      key: 'fuel_name',
      header: 'Fuel',
      label: 'Fuel',
      render: (lending) => lending.fuel_name,
    },
    {
      key: 'tank_name',
      header: 'Tank',
      label: 'Tank',
      render: (lending) => lending.tank_name || '-',
    },
    {
      key: 'guarantor_name',
      header: 'Guarantor',
      label: 'Guarantor',
      render: (lending) => lending.guarantor_name || '-',
    },
    {
      key: 'total_amount',
      header: 'Total',
      label: 'Total',
      sortable: true,
      render: (lending) => formatAmount(lending.total_amount),
    },
    {
      key: 'paid_amount',
      header: 'Paid',
      label: 'Paid',
      sortable: true,
      render: (lending) => formatAmount(lending.paid_amount),
    },
    {
      key: 'remaining_amount',
      header: 'Remaining',
      label: 'Remaining',
      sortable: true,
      render: (lending) => formatAmount(lending.remaining_amount),
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      render: (lending) => <Badge variant={statusVariantMap[lending.status]}>{lending.status_label}</Badge>,
    },
    {
      key: 'end_date',
      header: 'End Date',
      label: 'End Date',
      sortable: true,
      render: (lending) => new Date(lending.end_date).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      label: 'Actions',
      render: (lending) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(lending)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(lending)}>
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
        data={lendings}
        loading={loading}
        pagination={false}
        emptyMessage="No lendings found"
        getRowKey={(lending) => lending.id}
      />
    </Card>
  );
}
