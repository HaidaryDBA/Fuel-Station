import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import TankStorageTable from '../components/TankStorageTable';
import { useTankStorageFilters } from '../hooks/useInventoryFilters';
import { useTankStoragesList, useDeleteTankStorage } from '../queries/useInventoryQueries';
import type { TankStorage } from '../types/inventory';

export default function TankStoragesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useTankStorageFilters();
  const { data, isLoading, isError, refetch } = useTankStoragesList(params);
  const deleteTankStorageMutation = useDeleteTankStorage();

  const tanks = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (tank: TankStorage) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: `Tank #${tank.tank_number}` }));
    if (!confirmed) {
      return;
    }

    await deleteTankStorageMutation.mutateAsync(tank.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.tankTitle')}
        subtitle={t('inventory.tankSubtitle')}
        actions={[
          {
            label: t('inventory.addTank'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/fuel/tanks/new'),
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
          <TankStorageTable
            tanks={tanks}
            loading={isLoading}
            onView={(tank) => navigate(`/fuel/tanks/${tank.id}`)}
            onEdit={(tank) => navigate(`/fuel/tanks/${tank.id}/edit`)}
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
