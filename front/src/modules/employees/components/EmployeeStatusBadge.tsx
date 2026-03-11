import { Badge } from '@/components/ui';
import { useTranslation } from 'react-i18next';

import type { EmployeeStatus } from '../types/employee';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge variant={status === 'active' ? 'success' : 'error'} size="sm" dot>
      {status === 'active' ? t('customer.active') : t('customer.inactive')}
    </Badge>
  );
}
