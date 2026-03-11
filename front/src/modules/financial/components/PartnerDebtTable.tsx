import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';
import { truncateText } from '@/utils/truncateText';

import type { PartnerDebt } from '../types/financial';

interface PartnerDebtTableProps {
  partnerDebts: PartnerDebt[];
  loading?: boolean;
  onView: (partnerDebt: PartnerDebt) => void;
  onEdit: (partnerDebt: PartnerDebt) => void;
  onDelete: (partnerDebt: PartnerDebt) => void;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function PartnerDebtTable({
  partnerDebts,
  loading,
  onView,
  onEdit,
  onDelete,
}: PartnerDebtTableProps) {
  const { t } = useTranslation();

  const columns: Column<PartnerDebt>[] = [
    {
      key: 'partner_full_name',
      label: t('financial.partner'),
      header: t('financial.partner'),
      render: (debt) => debt.partner_full_name,
    },
    {
      key: 'amount_money',
      label: t('financial.amount'),
      header: t('financial.amount'),
      sortable: true,
      render: (debt) => `${formatAmount(debt.amount_money)} ${debt.currency_code}`,
    },
    {
      key: 'currency_rate',
      label: t('financial.currencyRate', 'Currency Rate'),
      header: t('financial.currencyRate', 'Currency Rate'),
      render: (debt) => Number(debt.currency_rate || 0).toFixed(6),
    },
    {
      key: 'total_in',
      label: t('financial.totalInBase', 'Total In Base'),
      header: t('financial.totalInBase', 'Total In Base'),
      sortable: true,
      render: (debt) => formatAmount(debt.total_in),
    },
    {
      key: 'paid_amount',
      label: t('financial.paidAmount', 'Paid Amount'),
      header: t('financial.paidAmount', 'Paid Amount'),
      sortable: true,
      render: (debt) => formatAmount(debt.paid_amount),
    },
    {
      key: 'remaining_amount',
      label: t('financial.remainingAmount', 'Remaining Amount'),
      header: t('financial.remainingAmount', 'Remaining Amount'),
      render: (debt) => formatAmount(debt.remaining_amount),
    },
    {
      key: 'status',
      label: t('financial.status', 'Status'),
      header: t('financial.status', 'Status'),
      render: (debt) => debt.status,
    },
    {
      key: 'paid_date',
      label: t('financial.paymentDate', 'Payment Date'),
      header: t('financial.paymentDate', 'Payment Date'),
      render: (debt) => (debt.paid_date ? new Date(debt.paid_date).toLocaleDateString() : '-'),
    },
    {
      key: 'created_by_name',
      label: t('financial.createdBy', 'Created By'),
      header: t('financial.createdBy', 'Created By'),
      render: (debt) => debt.created_by_name || '-',
    },
    {
      key: 'updated_at',
      label: t('financial.updatedAt', 'Updated At'),
      header: t('financial.updatedAt', 'Updated At'),
      render: (debt) => (debt.updated_at ? new Date(debt.updated_at).toLocaleDateString() : '-'),
    },
    {
      key: 'date',
      label: t('financial.date'),
      header: t('financial.date'),
      sortable: true,
      render: (debt) => new Date(debt.date).toLocaleDateString(),
    },
    {
      key: 'description',
      label: t('financial.description'),
      header: t('financial.description'),
      render: (debt) => {
        const description = (debt.description || '').trim();
        if (!description) {
          return '-';
        }
        return <span title={description}>{truncateText(description, 50)}</span>;
      },
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (debt) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(debt)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(debt)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(debt)}>
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
        data={partnerDebts}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noPartnerDebtsFound')}
        getRowKey={(debt) => debt.id}
      />
    </Card>
  );
}
