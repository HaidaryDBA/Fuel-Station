import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Select } from '@/components/ui';

import PriceTable from '../components/PriceTable';
import { usePriceHistoryFilters } from '../hooks/useInventoryFilters';
import { usePriceHistoriesList, useDeletePriceHistory } from '../queries/useInventoryQueries';
import type { PriceHistory } from '../types/inventory';

export default function PricesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, clearFilters } = usePriceHistoryFilters();
  const { data, isLoading, isError, refetch } = usePriceHistoriesList(params);
  const deletePriceHistory = useDeletePriceHistory();

  const prices = data?.results ?? [];

  const handleDelete = async (price: PriceHistory) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: price.fuel_name || 'Price' }));
    if (!confirmed) {
      return;
    }

    await deletePriceHistory.mutateAsync(price.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.priceTitle')}
        subtitle={t('inventory.priceSubtitle')}
        actions={[
          {
            label: t('inventory.addPrice'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/fuel/prices/new'),
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
        <PriceTable
          prices={prices}
          loading={isLoading}
          onView={(price) => navigate(`/fuel/prices/${price.id}`)}
          onEdit={(price) => navigate(`/fuel/prices/${price.id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
