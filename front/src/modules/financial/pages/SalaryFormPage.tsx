import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import SalaryForm from '../components/SalaryForm';
import {
  useCreateSalary,
  useEmployeeOptions,
  useSalaryDetail,
  useUpdateSalary,
} from '../queries/useFinancialQueries';
import type { SalaryFormValues } from '../types/financial';

export default function SalaryFormPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: salary, isLoading: isLoadingSalary, isError } = useSalaryDetail(parsedId, isEditMode);
  const { data: employeeData } = useEmployeeOptions({ status: 'active' });
  const createSalaryMutation = useCreateSalary();
  const updateSalaryMutation = useUpdateSalary(parsedId);

  const initialValues: Partial<SalaryFormValues> | undefined = salary
    ? {
        employee: salary.employee,
        year: salary.year,
        month: salary.month,
        base_salary: Number(salary.base_salary),
        bonus: Number(salary.bonus),
        net_salary: Number(salary.net_salary),
        pay_date: salary.pay_date,
        description: salary.description,
      }
    : undefined;

  const handleSubmit = async (values: SalaryFormValues) => {
    try {
      if (isEditMode) {
        await updateSalaryMutation.mutateAsync(values);
        toast.success(t('financial.salaryUpdated'));
        navigate(`/finance/salaries/${parsedId}`);
        return;
      }

      const createdSalary = await createSalaryMutation.mutateAsync(values);
      toast.success(t('financial.salaryCreated'));
      navigate(`/finance/salaries/${createdSalary.id}`);
    } catch {
      toast.error(t('financial.salarySaveFailed'));
    }
  };

  const activeEmployees = employeeData?.results ?? [];
  const salaryEmployeeMissingFromActiveList =
    !!salary && !activeEmployees.some((employee) => employee.id === salary.employee);
  const employeeOptions = salaryEmployeeMissingFromActiveList
    ? [
        ...activeEmployees,
        {
          id: salary.employee,
          display_name: salary.employee_name,
          status: 'inactive',
        },
      ]
    : activeEmployees;

  if (isEditMode && isLoadingSalary) {
    return (
      <Card>
        <CardContent>{t('financial.loadingSalaryForm')}</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !salary)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.salaryNotFound')}</p>
          <Button variant="outline" onClick={() => navigate('/finance/salaries')}>
            {t('financial.backToSalaries')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('financial.editSalary') : t('financial.addSalary')}
        subtitle={
          isEditMode ? t('financial.editSalarySubtitle') : t('financial.addSalarySubtitle')
        }
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/salaries'),
          },
        ]}
      />

      <SalaryForm
        initialValues={initialValues}
        employees={employeeOptions}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/finance/salaries')}
        isSubmitting={createSalaryMutation.isPending || updateSalaryMutation.isPending}
        submitLabel={isEditMode ? t('financial.update') : t('financial.create')}
      />
    </div>
  );
}
