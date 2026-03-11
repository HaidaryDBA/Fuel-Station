import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import EmployeeDetailCard from '../components/EmployeeDetailCard';
import {
  useActivateEmployee,
  useDeactivateEmployee,
  useDeleteEmployee,
  useEmployeeDetail,
} from '../queries/useEmployeeQueries';

export default function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const employeeId = Number(id);
  const { data: employee, isLoading, isError } = useEmployeeDetail(employeeId, Number.isFinite(employeeId));
  const deleteEmployeeMutation = useDeleteEmployee();
  const activateEmployeeMutation = useActivateEmployee();
  const deactivateEmployeeMutation = useDeactivateEmployee();

  const handleDelete = async () => {
    if (!employee) {
      return;
    }

    const confirmed = window.confirm(
      t('employee.deleteConfirm', { name: `${employee.first_name} ${employee.last_name}` })
    );
    if (!confirmed) {
      return;
    }

    await deleteEmployeeMutation.mutateAsync(employee.id);
    navigate('/employees');
  };

  const handleToggleStatus = async () => {
    if (!employee) {
      return;
    }

    if (employee.status === 'active') {
      await deactivateEmployeeMutation.mutateAsync(employee.id);
    } else {
      await activateEmployeeMutation.mutateAsync(employee.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('employee.loadingDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !employee) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('employee.failedToLoadDetails')}</p>
          <Button variant="outline" onClick={() => navigate('/employees')}>
            {t('employee.backToEmployees')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employee.details')}
        subtitle={t('employee.detailSubtitle')}
        actions={[
          {
            label: t('employee.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees'),
          },
          {
            label: t('employee.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/employees/${employee.id}/edit`),
          },
        ]}
      />

      <EmployeeDetailCard
        employee={employee}
        onBack={() => navigate('/employees')}
        onEdit={() => navigate(`/employees/${employee.id}/edit`)}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        deleting={deleteEmployeeMutation.isPending}
        statusUpdating={activateEmployeeMutation.isPending || deactivateEmployeeMutation.isPending}
      />
    </div>
  );
}
