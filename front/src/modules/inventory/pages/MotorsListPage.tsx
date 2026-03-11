import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Select } from '@/components/ui';

import MotorTable from '../components/MotorTable';
import { useFuelMotorFilters } from '../hooks/useInventoryFilters';
import { useFuelMotorsList, useDeleteFuelMotor } from '../queries/useInventoryQueries';
import type { FuelMotor } from '../types/inventory';

export default function MotorsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, clearFilters } = useFuelMotorFilters();
  const { data, isLoading, isError, refetch } = useFuelMotorsList(params);
  const deleteFuelMotor = useDeleteFuelMotor();

  const motors = data?.results ?? [];

  const handleDelete = async (motor: FuelMotor) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: motor.motor_name }));
    if (!confirmed) {
      return;
    }

    await deleteFuelMotor.mutateAsync(motor.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.motorTitle')}
        subtitle={t('inventory.motorSubtitle')}
        actions={[
          {
            label: t('inventory.addMotor'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/fuel/motors/new'),
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
                { label: t('inventory.nameAZ'), value: 'motor_name' },
                { label: t('inventory.nameZA'), value: '-motor_name' },
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
        <MotorTable
          motors={motors}
          loading={isLoading}
          onView={(motor) => navigate(`/fuel/motors/${motor.id}`)}
          onEdit={(motor) => navigate(`/fuel/motors/${motor.id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
