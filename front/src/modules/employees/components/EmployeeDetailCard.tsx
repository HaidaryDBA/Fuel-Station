import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';

import EmployeeStatusBadge from './EmployeeStatusBadge';
import type { Employee } from '../types/employee';

interface EmployeeDetailCardProps {
  employee: Employee;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  deleting?: boolean;
  statusUpdating?: boolean;
}

export default function EmployeeDetailCard({
  employee,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
  deleting = false,
  statusUpdating = false,
}: EmployeeDetailCardProps) {
  const { t } = useTranslation();
  const workDays = employee.work_days.join(', ');

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            {employee.picture ? (
              <img
                src={employee.picture}
                alt={`${employee.first_name} ${employee.last_name}`}
                className="h-12 w-12 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                <span className="text-lg font-semibold text-primary">
                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <span>{employee.first_name} {employee.last_name}</span>
            </div>
          </div>
        }
        subtitle={`${employee.phone} | ${employee.role}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('employee.back')}
            </Button>
            <Button variant="outline" onClick={onEdit}>
              {t('employee.edit')}
            </Button>
            <Button variant="outline" loading={statusUpdating} onClick={onToggleStatus}>
              {employee.status === 'active' ? t('employee.deactivate') : t('employee.activate')}
            </Button>
            <Button variant="danger" loading={deleting} onClick={onDelete}>
              {t('customer.delete')}
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label={t('employee.firstName')} value={employee.first_name} />
          <DetailItem label={t('employee.lastName')} value={employee.last_name} />
          <DetailItem label={t('employee.fatherName')} value={employee.father_name} />
          <DetailItem label={t('employee.phone')} value={employee.phone} />
          <DetailItem label={t('employee.salary')} value={`${Number(employee.salary).toFixed(2)}`} />
          <DetailItem label={t('employee.joinDate')} value={new Date(employee.join_date).toLocaleDateString()} />
          <DetailItem label={t('employee.membershipType')} value={<Badge variant="primary">{employee.membership_type}</Badge>} />
          <DetailItem label={t('employee.role')} value={<Badge variant="info">{employee.role}</Badge>} />
          <DetailItem label={t('employee.status')} value={<EmployeeStatusBadge status={employee.status} />} />
          <DetailItem label={t('employee.workDays')} value={workDays || 'N/A'} />
          <DetailItem label={t('customer.createdAt')} value={new Date(employee.created_at).toLocaleString()} />
          <DetailItem label={t('customer.updatedAt')} value={new Date(employee.updated_at).toLocaleString()} />
        </div>
        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">{t('customer.address')}</p>
          <p className="text-sm text-text-secondary">{employee.address}</p>
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
