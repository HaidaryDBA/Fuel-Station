import { Pencil, Trash2 } from 'lucide-react';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Sale } from '../types/sale';

interface SalesTableProps {
  sales: Sale[];
  loading?: boolean;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function SalesTable({ sales, loading, onEdit, onDelete }: SalesTableProps) {
  const columns: Column<Sale>[] = [
    {
      key: 'sale_id',
      header: 'Sale',
      label: 'Sale',
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-medium text-text-primary">#{sale.sale_id}</p>
          <p className="text-xs text-text-secondary">{new Date(sale.sale_date).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'fuel_name',
      header: 'Fuel',
      label: 'Fuel',
      render: (sale) => sale.fuel_name,
    },
    {
      key: 'motor_name',
      header: 'Motor',
      label: 'Motor',
      render: (sale) => sale.motor_name,
    },
    {
      key: 'amount',
      header: 'Amount',
      label: 'Amount',
      sortable: true,
      render: (sale) => sale.amount,
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      label: 'Unit Price',
      sortable: true,
      render: (sale) => `${formatAmount(sale.unit_price)} ${sale.currency_code}`,
    },
    {
      key: 'total_amount',
      header: 'Total',
      label: 'Total',
      sortable: true,
      render: (sale) => `${formatAmount(sale.total_amount)} ${sale.currency_code}`,
    },
    {
      key: 'total_amount_in_base_currency',
      header: 'Base Total',
      label: 'Base Total',
      sortable: true,
      render: (sale) => `${formatAmount(sale.total_amount_in_base_currency)} ${sale.base_currency_code || '-'}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      label: 'Actions',
      render: (sale) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(sale)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(sale)}>
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
        data={sales}
        loading={loading}
        pagination={false}
        emptyMessage="No sales found"
        getRowKey={(sale) => sale.id}
      />
    </Card>
  );
}
