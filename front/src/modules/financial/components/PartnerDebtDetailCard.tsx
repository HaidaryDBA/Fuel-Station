import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { PartnerDebt } from '../types/financial';

interface PartnerDebtDetailCardProps {
  partnerDebt: PartnerDebt;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '-');

export default function PartnerDebtDetailCard({
  partnerDebt,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: PartnerDebtDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={partnerDebt.partner_full_name}
        subtitle={`${formatAmount(partnerDebt.amount_money)} ${partnerDebt.currency_code}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('financial.back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('financial.edit')}
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              {t('financial.delete')}
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label={t('financial.partner')} value={partnerDebt.partner_full_name} />
          <DetailItem
            label={t('financial.amount')}
            value={`${formatAmount(partnerDebt.amount_money)} ${partnerDebt.currency_code}`}
          />
          <DetailItem label={t('financial.date')} value={formatDate(partnerDebt.date)} />
          <DetailItem
            label={t('financial.currencyRate', 'Currency Rate')}
            value={Number(partnerDebt.currency_rate || 0).toFixed(6)}
          />
          <DetailItem label={t('financial.totalInBase', 'Total In Base')} value={formatAmount(partnerDebt.total_in)} />
          <DetailItem label={t('financial.paidAmount', 'Paid Amount')} value={formatAmount(partnerDebt.paid_amount)} />
          <DetailItem label={t('financial.remainingAmount', 'Remaining Amount')} value={formatAmount(partnerDebt.remaining_amount)} />
          <DetailItem label={t('financial.status', 'Status')} value={partnerDebt.status} />
          <DetailItem label={t('financial.paymentDate', 'Payment Date')} value={formatDate(partnerDebt.paid_date)} />
          <DetailItem label={t('financial.createdBy', 'Created By')} value={partnerDebt.created_by_name || '-'} />
          <DetailItem label={t('financial.updatedBy', 'Updated By')} value={partnerDebt.updated_by_name || '-'} />
          <DetailItem label={t('financial.updatedAt', 'Updated At')} value={formatDate(partnerDebt.updated_at)} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('financial.description')}</p>
          <p className="text-sm text-text-secondary">{partnerDebt.description || '-'}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-text-primary">
            {t('financial.paymentHistory', 'Payment History')}
          </p>
          <div className="space-y-3">
            {(partnerDebt.payments ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">{t('financial.noPaymentsYet', 'No payments yet.')}</p>
            ) : (
              (partnerDebt.payments ?? []).map((payment) => (
                <div key={payment.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm text-text-primary">
                    {formatAmount(payment.amount_paid)} {payment.currency_paid_code} · {formatDate(payment.paid_date)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('financial.currencyRate', 'Currency Rate')}: {Number(payment.currency_rate || 0).toFixed(6)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('financial.totalInBase', 'Total In Base')}: {formatAmount(payment.amount_paid_in_base)}
                  </p>
                  <p className="text-xs text-text-secondary">{payment.description || '-'}</p>
                </div>
              ))
            )}
          </div>
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
