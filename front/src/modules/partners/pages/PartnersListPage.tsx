import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import PartnerTable from '../components/PartnerTable';
import { usePartnerFilters } from '../hooks/usePartnerFilters';
import { useDeletePartner, usePartnersList } from '../queries/usePartnerQueries';
import type { Partner } from '../types/partner';

export default function PartnersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = usePartnerFilters();
  const { data, isLoading, isError, refetch } = usePartnersList(params);
  const deletePartnerMutation = useDeletePartner();
  const today = new Date().toISOString().slice(0, 10);

  const partners = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (partner: Partner) => {
    const confirmed = window.confirm(t('partner.deleteConfirm', { name: partner.full_name }));
    if (!confirmed) {
      return;
    }

    await deletePartnerMutation.mutateAsync(partner.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('partner.title')}
        subtitle={t('partner.subtitle')}
        actions={[
          {
            label: t('partner.add'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/employees/partners/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('partner.searchPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Input
              type="date"
              max={today}
              label={t('partner.joinDateFrom')}
              value={filters.joinDateFrom}
              onChange={(event) => updateFilter('joinDateFrom', event.target.value)}
            />
            <Input
              type="date"
              max={today}
              label={t('partner.joinDateTo')}
              value={filters.joinDateTo}
              onChange={(event) => updateFilter('joinDateTo', event.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              label={t('partner.minShare')}
              value={filters.minShare}
              onChange={(event) => updateFilter('minShare', event.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              label={t('partner.maxShare')}
              value={filters.maxShare}
              onChange={(event) => updateFilter('maxShare', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('partner.perPage10'), value: '10' },
                { label: t('partner.perPage25'), value: '25' },
                { label: t('partner.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('partner.newest'), value: '-id' },
                { label: t('partner.oldest'), value: 'id' },
                { label: t('partner.nameAZ'), value: 'first_name' },
                { label: t('partner.nameZA'), value: '-first_name' },
                { label: t('partner.shareLowHigh'), value: 'share_percentage' },
                { label: t('partner.shareHighLow'), value: '-share_percentage' },
                { label: t('partner.joinDateNewest'), value: '-Join_date' },
                { label: t('partner.joinDateOldest'), value: 'Join_date' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('partner.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('partner.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('partner.failedToLoad')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <PartnerTable
            partners={partners}
            loading={isLoading}
            onView={(partner) => navigate(`/employees/partners/${partner.id}`)}
            onEdit={(partner) => navigate(`/employees/partners/${partner.id}/edit`)}
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
