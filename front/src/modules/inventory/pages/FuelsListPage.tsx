import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import FuelTable from '../components/FuelTable';
import { useFuelFilters } from '../hooks/useInventoryFilters';
import { useFuelsList, useDeleteFuel } from '../queries/useInventoryQueries';
import type { Fuel } from '../types/inventory';

export default function FuelsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useFuelFilters();
  const { data, isLoading, isError, refetch } = useFuelsList(params);
  const deleteFuelMutation = useDeleteFuel();

  const fuels = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (fuel: Fuel) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: fuel.fuel_name }));
    if (!confirmed) {
      return;
    }

    await deleteFuelMutation.mutateAsync(fuel.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.fuelTitle')}
        subtitle={t('inventory.fuelSubtitle')}
        actions={[
          {
            label: t('inventory.addFuel'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/fuel/fuels/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('inventory.searchPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('inventory.perPage10'), value: '10' },
                { label: t('inventory.perPage25'), value: '25' },
                { label: t('inventory.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('inventory.newest'), value: '-id' },
                { label: t('inventory.oldest'), value: 'id' },
                { label: t('inventory.nameAZ'), value: 'fuel_name' },
                { label: t('inventory.nameZA'), value: '-fuel_name' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('inventory.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('inventory.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('inventory.failedToLoad')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <FuelTable
            fuels={fuels}
            loading={isLoading}
            onView={(fuel) => navigate(`/fuel/fuels/${fuel.id}`)}
            onEdit={(fuel) => navigate(`/fuel/fuels/${fuel.id}/edit`)}
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
