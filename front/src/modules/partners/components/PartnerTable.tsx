import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Partner } from '../types/partner';

interface PartnerTableProps {
  partners: Partner[];
  loading?: boolean;
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
}

const getInitials = (partner: Partner) =>
  `${partner.first_name?.[0] || ''}${partner.last_name?.[0] || ''}`.toUpperCase();

export default function PartnerTable({
  partners,
  loading,
  onView,
  onEdit,
  onDelete,
}: PartnerTableProps) {
  const { t } = useTranslation();

  const columns: Column<Partner>[] = [
    {
      key: 'profile',
      label: t('partner.profile'),
      header: t('partner.profile'),
      render: (partner) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-text-secondary">
            {getInitials(partner) || 'NA'}
          </div>
          <div>
            <p className="font-medium text-text-primary">{partner.full_name}</p>
            <p className="text-xs text-text-secondary">{partner.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'father_name',
      label: t('partner.fatherName'),
      header: t('partner.fatherName'),
      render: (partner) => partner.father_name,
    },
    {
      key: 'share_percentage',
      label: t('partner.sharePercentage'),
      header: t('partner.sharePercentage'),
      sortable: true,
      render: (partner) => `${Number(partner.share_percentage).toFixed(2)}%`,
    },
    {
      key: 'join_date',
      label: t('partner.joinDate'),
      header: t('partner.joinDate'),
      sortable: true,
      render: (partner) => new Date(partner.join_date).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('partner.actions'),
      header: t('partner.actions'),
      render: (partner) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(partner)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(partner)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(partner)}>
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
        data={partners}
        loading={loading}
        pagination={false}
        emptyMessage={t('partner.noPartnersFound')}
        getRowKey={(partner) => partner.id}
      />
    </Card>
  );
}
