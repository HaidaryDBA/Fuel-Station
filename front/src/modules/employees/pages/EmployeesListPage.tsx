import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { PageHeader } from '@/components';
import {
  Button,
  Card,
  CardContent,
  Input,
  Pagination,
  PaginationInfo,
  Select,
} from '@/components/ui';

import EmployeeTable from '../components/EmployeeTable';
import { useEmployeeFilters } from '../hooks/useEmployeeFilters';
import {
  useActivateEmployee,
  useDeactivateEmployee,
  useDeleteEmployee,
  useEmployeesList,
} from '../queries/useEmployeeQueries';
import {
  employeeMembershipOptions,
  employeeRoleOptions,
  employeeStatusOptions,
  type Employee,
} from '../types/employee';

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useEmployeeFilters();
  const { data, isLoading, isError, refetch } = useEmployeesList(params);
  const deleteEmployeeMutation = useDeleteEmployee();
  const activateEmployeeMutation = useActivateEmployee();
  const deactivateEmployeeMutation = useDeactivateEmployee();
  const [statusProcessingId, setStatusProcessingId] = useState<number | null>(null);

  const employees = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      t('employee.deleteConfirm', { name: `${employee.first_name} ${employee.last_name}` })
    );
    if (!confirmed) {
      return;
    }

    await deleteEmployeeMutation.mutateAsync(employee.id);
  };

  const handleToggleStatus = async (employee: Employee) => {
    setStatusProcessingId(employee.id);
    try {
      if (employee.status === 'active') {
        await deactivateEmployeeMutation.mutateAsync(employee.id);
      } else {
        await activateEmployeeMutation.mutateAsync(employee.id);
      }
    } finally {
      setStatusProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employee.title')}
        subtitle={t('employee.subtitle')}
        actions={[
          {
            label: t('employee.add'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/employees/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('employee.searchPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.roleName}
              options={[
                { label: t('employee.allRoles'), value: '' },
                ...employeeRoleOptions,
              ]}
              onChange={(event) => updateFilter('roleName', event.target.value)}
            />
            <Select
              value={filters.status}
              options={[
                { label: t('employee.allStatuses'), value: '' },
                ...employeeStatusOptions,
              ]}
              onChange={(event) => updateFilter('status', event.target.value)}
            />
            <Select
              value={filters.membershipType}
              options={[
                { label: t('employee.allMembershipTypes'), value: '' },
                ...employeeMembershipOptions,
              ]}
              onChange={(event) => updateFilter('membershipType', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('employee.perPage10'), value: '10' },
                { label: t('employee.perPage25'), value: '25' },
                { label: t('employee.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('employee.newest'), value: '-created_at' },
                { label: t('employee.oldest'), value: 'created_at' },
                { label: t('employee.salaryLowHigh'), value: 'salary' },
                { label: t('employee.salaryHighLow'), value: '-salary' },
                { label: t('employee.joinDateNewest'), value: '-join_date' },
                { label: t('employee.joinDateOldest'), value: 'join_date' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('employee.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('employee.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('employee.failedToLoad')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <EmployeeTable
            employees={employees}
            loading={isLoading}
            statusProcessingId={statusProcessingId}
            onView={(employee) => navigate(`/employees/${employee.id}`)}
            onEdit={(employee) => navigate(`/employees/${employee.id}/edit`)}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalItems={totalCount}
              />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
