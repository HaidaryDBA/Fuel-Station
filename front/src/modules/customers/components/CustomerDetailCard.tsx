import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Customer } from '../types/customer';

interface CustomerDetailCardProps {
  customer: Customer;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function CustomerDetailCard({
  customer,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: CustomerDetailCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader
        title={customer.full_name}
        subtitle={customer.email || t('customer.noEmailProvided')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('customer.back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('customer.edit')}
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              {t('customer.delete')}
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Badge variant={customer.is_active ? 'success' : 'warning'} dot>
            {customer.is_active ? t('customer.active') : t('customer.inactive')}
          </Badge>
          <p className="text-sm text-text-secondary">
            {t('customer.joinedOn')} {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label={t('customer.firstName')} value={customer.first_name} />
          <DetailItem label={t('customer.lastName')} value={customer.last_name} />
          <DetailItem label={t('customer.phone')} value={customer.phone || '-'} />
          <DetailItem label={t('customer.email')} value={customer.email || '-'} />
          <DetailItem label={t('customer.updatedAt')} value={new Date(customer.updated_at).toLocaleString()} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('customer.address')}</p>
          <p className="text-sm text-text-secondary">{customer.address || t('customer.noAddressProvided')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-sm text-text-primary">{value}</div>
    </div>
  );
}
