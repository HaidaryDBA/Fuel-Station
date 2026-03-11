import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import PartnerDebtTable from '../components/PartnerDebtTable';
import { usePartnerDebtFilters } from '../hooks/useFinancialFilters';
import {
  useCurrenciesList,
  useDeletePartnerDebt,
  usePartnerDebtsList,
  usePartnerOptions,
} from '../queries/useFinancialQueries';
import type { PartnerDebt } from '../types/financial';

export default function PartnerDebtsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = usePartnerDebtFilters();
  const { data, isLoading, isError, refetch } = usePartnerDebtsList(params);
  const { data: partnerData } = usePartnerOptions();
  const { data: currencyData } = useCurrenciesList();
  const deletePartnerDebtMutation = useDeletePartnerDebt();
  const today = new Date().toISOString().slice(0, 10);

  const partnerDebts = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const partnerOptions = [
    { label: t('financial.allPartners'), value: '' },
    ...(partnerData?.results ?? []).map((partner) => ({
      label: partner.full_name,
      value: String(partner.id),
    })),
  ];

  const currencyOptions = [
    { label: t('financial.allCurrencies'), value: '' },
    ...(currencyData?.results ?? []).map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: String(currency.id),
    })),
  ];

  const handleDelete = async (partnerDebt: PartnerDebt) => {
    const confirmed = window.confirm(
      t('financial.deletePartnerDebtConfirm', { name: partnerDebt.partner_full_name })
    );
    if (!confirmed) {
      return;
    }

    await deletePartnerDebtMutation.mutateAsync(partnerDebt.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.partnerDebtsTitle')}
        subtitle={t('financial.partnerDebtsSubtitle')}
        actions={[
          {
            label: t('financial.addPartnerDebt'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/partner-debts/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchPartnerDebtPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.partner}
              options={partnerOptions}
              onChange={(event) => updateFilter('partner', event.target.value)}
            />
            <Select
              value={filters.currency}
              options={currencyOptions}
              onChange={(event) => updateFilter('currency', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.fromDate')}
              max={today}
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.toDate')}
              max={today}
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
                { label: t('financial.newest'), value: '-date' },
                { label: t('financial.oldest'), value: 'date' },
                { label: t('financial.amountLowHigh'), value: 'amount_money' },
                { label: t('financial.amountHighLow'), value: '-amount_money' },
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
            <p className="text-sm text-error">{t('financial.failedToLoadPartnerDebts')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <PartnerDebtTable
            partnerDebts={partnerDebts}
            loading={isLoading}
            onView={(partnerDebt) => navigate(`/finance/partner-debts/${partnerDebt.id}`)}
            onEdit={(partnerDebt) => navigate(`/finance/partner-debts/${partnerDebt.id}/edit`)}
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
