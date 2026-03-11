import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import SalaryTable from '../components/SalaryTable';
import { useSalaryFilters } from '../hooks/useFinancialFilters';
import { useDeleteSalary, useEmployeeOptions, useSalariesList } from '../queries/useFinancialQueries';
import type { Salary } from '../types/financial';

export default function SalariesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useSalaryFilters();
  const { data, isLoading, isError, refetch } = useSalariesList(params);
  const { data: employeeData } = useEmployeeOptions();
  const deleteSalaryMutation = useDeleteSalary();

  const salaries = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const getEmployeeLabel = (employee: { first_name?: string; last_name?: string; display_name?: string }) => {
    return (
      employee.display_name
      || `${employee.first_name || ''} ${employee.last_name || ''}`
    ).trim();
  };

  const employeeOptions = [
    { label: t('financial.allEmployees'), value: '' },
    ...(employeeData?.results ?? []).map((employee) => ({
      label: getEmployeeLabel(employee) || `#${employee.id}`,
      value: String(employee.id),
    })),
  ];

  const handleDelete = async (salary: Salary) => {
    const confirmed = window.confirm(
      t('financial.deleteSalaryConfirm', { name: salary.employee_name, month: salary.month, year: salary.year })
    );
    if (!confirmed) {
      return;
    }

    await deleteSalaryMutation.mutateAsync(salary.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.salariesTitle')}
        subtitle={t('financial.salariesSubtitle')}
        actions={[
          {
            label: t('financial.addSalary'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/salaries/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchSalaryPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.employee}
              options={employeeOptions}
              onChange={(event) => updateFilter('employee', event.target.value)}
            />
            <Input
              type="number"
              min="2000"
              max="2200"
              label={t('financial.year')}
              value={filters.year}
              onChange={(event) => updateFilter('year', event.target.value)}
            />
            <Input
              type="number"
              min="1"
              max="12"
              label={t('financial.month')}
              value={filters.month}
              onChange={(event) => updateFilter('month', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('financial.perPage10'), value: '10' },
                { label: t('financial.perPage25'), value: '25' },
                { label: t('financial.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('financial.newest'), value: '-pay_date' },
                { label: t('financial.oldest'), value: 'pay_date' },
                { label: t('financial.netSalaryLowHigh'), value: 'net_salary' },
                { label: t('financial.netSalaryHighLow'), value: '-net_salary' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('financial.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('financial.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('financial.failedToLoadSalaries')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <SalaryTable
            salaries={salaries}
            loading={isLoading}
            onView={(salary) => navigate(`/finance/salaries/${salary.id}`)}
            onEdit={(salary) => navigate(`/finance/salaries/${salary.id}/edit`)}
            onDelete={handleDelete}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo currentPage={filters.page} pageSize={filters.pageSize} totalItems={totalCount} />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
