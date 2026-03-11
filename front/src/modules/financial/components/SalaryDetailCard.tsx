import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Salary } from '../types/financial';

interface SalaryDetailCardProps {
  salary: Salary;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function SalaryDetailCard({
  salary,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: SalaryDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={salary.employee_name}
        subtitle={`${salary.year}/${String(salary.month).padStart(2, '0')}`}
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
          <DetailItem label={t('financial.employee')} value={salary.employee_name} />
          <DetailItem label={t('financial.year')} value={salary.year} />
          <DetailItem label={t('financial.month')} value={salary.month} />
          <DetailItem label={t('financial.payDate')} value={new Date(salary.pay_date).toLocaleDateString()} />
          <DetailItem label={t('financial.baseSalary')} value={formatAmount(salary.base_salary)} />
          <DetailItem label={t('financial.bonus')} value={formatAmount(salary.bonus)} />
          <DetailItem label={t('financial.netSalary')} value={formatAmount(salary.net_salary)} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('financial.description')}</p>
          <p className="text-sm text-text-secondary">{salary.description || '-'}</p>
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
