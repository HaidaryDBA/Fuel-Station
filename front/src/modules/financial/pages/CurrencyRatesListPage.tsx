import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import CurrencyRateTable from '../components/CurrencyRateTable';
import { useCurrencyRateFilters } from '../hooks/useFinancialFilters';
import { useCurrenciesList, useCurrencyRatesList, useDeleteCurrencyRate } from '../queries/useFinancialQueries';
import type { CurrencyRate } from '../types/financial';

export default function CurrencyRatesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useCurrencyRateFilters();
  const { data, isLoading, isError, refetch } = useCurrencyRatesList(params);
  const { data: currencyData } = useCurrenciesList();
  const deleteCurrencyRateMutation = useDeleteCurrencyRate();

  const rates = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const currencyOptions = [
    { label: t('financial.allCurrencies'), value: '' },
    ...(currencyData?.results ?? []).map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: String(currency.id),
    })),
  ];

  const handleDelete = async (rate: CurrencyRate) => {
    const confirmed = window.confirm(
      t(
        'financial.deleteCurrencyRateConfirm',
        'Delete rate {{from}} -> {{to}} on {{date}}?',
        {
          from: rate.from_currency_code,
          to: rate.to_currency_code,
          date: new Date(rate.date).toLocaleDateString(),
        }
      )
    );
    if (!confirmed) {
      return;
    }

    await deleteCurrencyRateMutation.mutateAsync(rate.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.currencyRatesTitle', 'Currency Rates')}
        subtitle={t('financial.currencyRatesSubtitle', 'Manage exchange rates between currencies')}
        actions={[
          {
            label: t('financial.addCurrencyRate', 'Add Currency Rate'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/currency-rates/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchCurrencyRatePlaceholder', 'Search by currency code or creator')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label={t('financial.fromCurrency', 'From Currency')}
              value={filters.fromCurrency}
              options={currencyOptions}
              onChange={(event) => updateFilter('fromCurrency', event.target.value)}
            />
            <Select
              label={t('financial.toCurrency', 'To Currency')}
              value={filters.toCurrency}
              options={currencyOptions}
              onChange={(event) => updateFilter('toCurrency', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.fromDate')}
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.toDate')}
              value={filters.dateTo}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
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
                { label: t('financial.newest', 'Newest'), value: '-date' },
                { label: t('financial.oldest', 'Oldest'), value: 'date' },
                { label: t('financial.rateLowHigh', 'Rate Low-High'), value: 'rate_value' },
                { label: t('financial.rateHighLow', 'Rate High-Low'), value: '-rate_value' },
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
            <p className="text-sm text-error">
              {t('financial.failedToLoadCurrencyRates', 'Failed to load currency rates')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CurrencyRateTable
            rates={rates}
            loading={isLoading}
            onEdit={(rate) => navigate(`/finance/currency-rates/${rate.id}/edit`)}
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
