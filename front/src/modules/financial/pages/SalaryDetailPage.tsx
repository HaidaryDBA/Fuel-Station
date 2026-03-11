import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import SalaryDetailCard from '../components/SalaryDetailCard';
import { useDeleteSalary, useSalaryDetail } from '../queries/useFinancialQueries';

export default function SalaryDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const salaryId = Number(id);
  const { data: salary, isLoading, isError } = useSalaryDetail(salaryId, Number.isFinite(salaryId));
  const deleteSalaryMutation = useDeleteSalary();

  const handleDelete = async () => {
    if (!salary) {
      return;
    }

    const confirmed = window.confirm(
      t('financial.deleteSalaryConfirm', { name: salary.employee_name, month: salary.month, year: salary.year })
    );
    if (!confirmed) {
      return;
    }

    await deleteSalaryMutation.mutateAsync(salary.id);
    navigate('/finance/salaries');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t('financial.loadingSalaryDetails')}</CardContent>
      </Card>
    );
  }

  if (isError || !salary) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">{t('financial.failedToLoadSalaryDetails')}</p>
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
        title={t('financial.salaryDetails')}
        subtitle={t('financial.salaryDetailSubtitle')}
        actions={[
          {
            label: t('financial.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/finance/salaries'),
          },
          {
            label: t('financial.edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/finance/salaries/${salary.id}/edit`),
          },
        ]}
      />

      <SalaryDetailCard
        salary={salary}
        onBack={() => navigate('/finance/salaries')}
        onEdit={() => navigate(`/finance/salaries/${salary.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteSalaryMutation.isPending}
      />
    </div>
  );
}
