import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import CustomerTable from '../components/CustomerTable';
import { useCustomerFilters } from '../hooks/useCustomerFilters';
import { useCustomersList, useDeleteCustomer } from '../queries/useCustomerQueries';
import type { Customer } from '../types/customer';

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useCustomerFilters();
  const { data, isLoading, isError, refetch } = useCustomersList(params);
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(t('customer.deleteConfirm', { name: customer.full_name }));
    if (!confirmed) {
      return;
    }

    await deleteCustomerMutation.mutateAsync(customer.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customer.title')}
        subtitle={t('customer.subtitle')}
        actions={[
          {
            label: t('customer.add'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/employees/customers/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('customer.searchPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.isActive}
              options={[
                { label: t('customer.allStatuses'), value: '' },
                { label: t('customer.active'), value: 'true' },
                { label: t('customer.inactive'), value: 'false' },
              ]}
              onChange={(event) => updateFilter('isActive', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('customer.perPage10'), value: '10' },
                { label: t('customer.perPage25'), value: '25' },
                { label: t('customer.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('customer.newest'), value: '-created_at' },
                { label: t('customer.oldest'), value: 'created_at' },
                { label: t('customer.nameAZ'), value: 'first_name' },
                { label: t('customer.nameZA'), value: '-first_name' },
                { label: t('customer.highestPurchases'), value: '-total_purchases' },
                { label: t('customer.lowestPurchases'), value: 'total_purchases' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('customer.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('customer.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('customer.failedToLoad')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CustomerTable
            customers={customers}
            loading={isLoading}
            onView={(customer) => navigate(`/employees/customers/${customer.id}`)}
            onEdit={(customer) => navigate(`/employees/customers/${customer.id}/edit`)}
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
