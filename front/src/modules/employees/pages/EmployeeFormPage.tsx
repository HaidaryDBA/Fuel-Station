import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import EmployeeForm from '../components/EmployeeForm';
import { useCreateEmployee, useEmployeeDetail, useUpdateEmployee } from '../queries/useEmployeeQueries';
import type { EmployeeFormValues } from '../types/employee';

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: employee, isLoading: isLoadingEmployee, isError } = useEmployeeDetail(parsedId, isEditMode);
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee(parsedId);

  const initialValues: Partial<EmployeeFormValues> | undefined = employee
    ? {
        first_name: employee.first_name,
        last_name: employee.last_name,
        father_name: employee.father_name,
        address: employee.address,
        phone: employee.phone,
        salary: Number(employee.salary),
        work_days: employee.work_days,
        join_date: employee.join_date,
        membership_type: employee.membership_type,
        role: employee.role,
        status: employee.status,
      }
    : undefined;

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      if (isEditMode) {
        await updateEmployeeMutation.mutateAsync(values);
        toast.success(t('employee.updated'));
        navigate(`/employees/${parsedId}`);
        return;
      }

      const createdEmployee = await createEmployeeMutation.mutateAsync(values);
      toast.success(t('employee.created'));
      navigate(`/employees/${createdEmployee.id}`);
    } catch {
      toast.error(t('employee.saveFailed'));
    }
  };

  if (isEditMode && isLoadingEmployee) {
    return (
      <Card>
        <CardContent>{t('employee.loadingFormData')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !employee)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('employee.notFound')}</p>
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
        title={isEditMode ? t('employee.edit') : t('employee.add')}
        subtitle={isEditMode ? t('employee.editSubtitle') : t('employee.addSubtitle')}
        actions={[
          {
            label: t('employee.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/employees'),
          },
        ]}
      />

      <EmployeeForm
        initialValues={initialValues}
        initialPictureUrl={employee?.picture}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
        isSubmitting={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
        submitLabel={isEditMode ? t('employee.update') : t('employee.create')}
      />
    </div>
  );
}
