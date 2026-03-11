import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import CurrencyTable from '../components/CurrencyTable';
import { useCurrencyFilters } from '../hooks/useFinancialFilters';
import { useCurrencies, useDeleteCurrency } from '../queries/useFinancialQueries';
import type { Currency } from '../types/financial';

export default function CurrenciesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useCurrencyFilters();
  const { data, isLoading, isError, refetch } = useCurrencies(params);
  const deleteCurrencyMutation = useDeleteCurrency();

  const currencies = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (currency: Currency) => {
    const confirmed = window.confirm(
      t('financial.deleteCurrencyConfirm', 'Delete currency "{{code}} - {{name}}"?', {
        code: currency.code,
        name: currency.name,
      })
    );
    if (!confirmed) {
      return;
    }

    await deleteCurrencyMutation.mutateAsync(currency.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.currenciesTitle', 'Currencies')}
        subtitle={t('financial.currenciesSubtitle', 'Manage financial currencies and base currency')}
        actions={[
          {
            label: t('financial.addCurrency', 'Add Currency'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/currencies/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchCurrencyPlaceholder', 'Search by code, name, or symbol')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label={t('financial.base', 'Base')}
              value={filters.isBase}
              options={[
                { label: t('financial.all', 'All'), value: '' },
                { label: t('financial.baseOnly', 'Base only'), value: 'true' },
                { label: t('financial.nonBaseOnly', 'Non-base only'), value: 'false' },
              ]}
              onChange={(event) => updateFilter('isBase', event.target.value)}
            />
            <Select
              label={t('financial.status', 'Status')}
              value={filters.isActive}
              options={[
                { label: t('financial.all', 'All'), value: '' },
                { label: t('financial.active', 'Active'), value: 'true' },
                { label: t('financial.inactive', 'Inactive'), value: 'false' },
              ]}
              onChange={(event) => updateFilter('isActive', event.target.value)}
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
                { label: t('financial.codeAZ', 'Code A-Z'), value: 'code' },
                { label: t('financial.codeZA', 'Code Z-A'), value: '-code' },
                { label: t('financial.newest', 'Newest'), value: '-created_at' },
                { label: t('financial.oldest', 'Oldest'), value: 'created_at' },
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
            <p className="text-sm text-error">{t('financial.failedToLoadCurrencies', 'Failed to load currencies')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CurrencyTable
            currencies={currencies}
            loading={isLoading}
            onEdit={(currency) => navigate(`/finance/currencies/${currency.id}/edit`)}
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
