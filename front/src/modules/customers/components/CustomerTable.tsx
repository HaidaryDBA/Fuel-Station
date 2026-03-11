import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Customer } from '../types/customer';

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const getInitials = (customer: Customer) =>
  `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase();

export default function CustomerTable({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const { t } = useTranslation();
  
  const columns: Column<Customer>[] = [
    {
      key: 'profile',
      label: t('customer.profile'),
      header: t('customer.profile'),
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-text-secondary">
            {getInitials(customer) || 'NA'}
          </div>
          <div>
            <p className="font-medium text-text-primary">{customer.full_name}</p>
            <p className="text-xs text-text-secondary">{customer.email || t('customer.noEmail')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: t('customer.phone'),
      header: t('customer.phone'),
      render: (customer) => customer.phone || '-',
    },
    {
      key: 'is_active',
      label: t('customer.status'),
      header: t('customer.status'),
      render: (customer) => (
        <Badge variant={customer.is_active ? 'success' : 'warning'} size="sm" dot>
          {customer.is_active ? t('customer.active') : t('customer.inactive')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: t('customer.createdAt'),
      header: t('customer.createdAt'),
      sortable: true,
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('customer.status'),
      header: 'Actions',
      render: (customer) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(customer)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(customer)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(customer)}>
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
        data={customers}
        loading={loading}
        pagination={false}
        emptyMessage={t('customer.noCustomersFound')}
        getRowKey={(customer) => customer.id}
      />
    </Card>
  );
}
