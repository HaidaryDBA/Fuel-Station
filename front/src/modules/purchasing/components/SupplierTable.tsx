import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Supplier } from '../types/purchasing';

interface SupplierTableProps {
  suppliers: Supplier[];
  loading?: boolean;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export default function SupplierTable({
  suppliers,
  loading,
  onView,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const { t } = useTranslation();

  const columns: Column<Supplier>[] = [
    {
      key: 'supplier_name',
      label: t('purchasing.supplierName', 'Supplier Name'),
      header: t('purchasing.supplierName', 'Supplier Name'),
      render: (supplier) => <div className="font-medium text-text-primary">{supplier.supplier_name}</div>,
    },
    {
      key: 'phone',
      label: t('purchasing.phone', 'Phone'),
      header: t('purchasing.phone', 'Phone'),
      render: (supplier) => supplier.phone || '-',
    },
    {
      key: 'address',
      label: t('purchasing.address', 'Address'),
      header: t('purchasing.address', 'Address'),
      render: (supplier) => supplier.address || '-',
    },
    {
      key: 'actions',
      label: t('purchasing.actions', 'Actions'),
      header: t('purchasing.actions', 'Actions'),
      render: (supplier) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(supplier)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(supplier)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(supplier)}>
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
        data={suppliers}
        loading={loading}
        pagination={false}
        emptyMessage={t('purchasing.noSuppliersFound', 'No suppliers found')}
        getRowKey={(supplier) => supplier.id}
      />
    </Card>
  );
}

