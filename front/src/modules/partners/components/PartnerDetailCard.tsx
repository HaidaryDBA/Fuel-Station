import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Partner } from '../types/partner';

interface PartnerDetailCardProps {
  partner: Partner;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function PartnerDetailCard({
  partner,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: PartnerDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={partner.full_name}
        subtitle={`${t('partner.sharePercentage')}: ${Number(partner.share_percentage).toFixed(2)}%`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('partner.back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('partner.edit')}
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              {t('partner.delete')}
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label={t('partner.firstName')} value={partner.first_name} />
          <DetailItem label={t('partner.fatherName')} value={partner.father_name} />
          <DetailItem label={t('partner.lastName')} value={partner.last_name} />
          <DetailItem label={t('partner.phone')} value={partner.phone} />
          <DetailItem
            label={t('partner.dateOfBirth')}
            value={new Date(partner.date_of_birth).toLocaleDateString()}
          />
          <DetailItem
            label={t('partner.joinDate')}
            value={new Date(partner.join_date).toLocaleDateString()}
          />
          <DetailItem
            label={t('partner.sharePercentage')}
            value={`${Number(partner.share_percentage).toFixed(2)}%`}
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('partner.mainAddress')}</p>
          <p className="text-sm text-text-secondary">{partner.main_address}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('partner.currentAddress')}</p>
          <p className="text-sm text-text-secondary">{partner.current_address}</p>
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
