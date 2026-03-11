import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import FinancialTransactionTable from '../components/FinancialTransactionTable';
import {
  financialTransactionReferenceOptions,
  financialTransactionTypeOptions,
  getFinancialTransactionReferenceLabel,
  getFinancialTransactionTypeLabel,
} from '../constants/financialTransactionOptions';
import { useFinancialTransactionFilters } from '../hooks/useFinancialFilters';
import {
  useAccountsList,
  useCurrenciesList,
  useDeleteFinancialTransaction,
  useFinancialTransactionsList,
} from '../queries/useFinancialQueries';
import type { FinancialTransaction } from '../types/financial';

export default function FinancialTransactionsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useFinancialTransactionFilters();
  const { data, isLoading, isError, refetch } = useFinancialTransactionsList(params);
  const { data: accountData } = useAccountsList({ page_size: 300, is_active: true });
  const { data: currencyData } = useCurrenciesList();
  const deleteTransactionMutation = useDeleteFinancialTransaction();
  const today = new Date().toISOString().slice(0, 16);

  const transactions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const currencyOptions = [
    { label: t('financial.allCurrencies', 'All Currencies'), value: '' },
    ...(currencyData?.results ?? []).map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: String(currency.id),
    })),
  ];

  const accountOptions = [
    { label: t('financial.allAccounts', 'All Accounts'), value: '' },
    ...(accountData?.results ?? []).map((account) => ({
      label: `${account.name} (${account.currency_code})`,
      value: String(account.id),
    })),
  ];

  const referenceTypeOptions = [
    { label: t('financial.allReferenceTypes', 'All Reference Types'), value: '' },
    ...financialTransactionReferenceOptions.map((option) => ({
      label: getFinancialTransactionReferenceLabel(option.value, t),
      value: option.value,
    })),
  ];

  const transactionTypeOptions = [
    { label: t('financial.allTransactionTypes', 'All Types'), value: '' },
    ...financialTransactionTypeOptions.map((option) => ({
      label: getFinancialTransactionTypeLabel(option.value, t),
      value: option.value,
    })),
  ];

  const handleDelete = async (transaction: FinancialTransaction) => {
    const confirmed = window.confirm(
      t('financial.deleteTransactionConfirm', 'Delete this financial transaction?')
    );
    if (!confirmed) {
      return;
    }

    await deleteTransactionMutation.mutateAsync(transaction.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.transactionsTitle', 'Financial Transactions')}
        subtitle={t(
          'financial.transactionsSubtitle',
          'Track deposits, withdrawals, and transfers across finance accounts.'
        )}
        actions={[
          {
            label: t('financial.addTransaction', 'Add Transaction'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/transactions/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchTransactionPlaceholder', 'Search transactions')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label={t('financial.transactionType', 'Transaction Type')}
              value={filters.transactionType}
              options={transactionTypeOptions}
              onChange={(event) => updateFilter('transactionType', event.target.value)}
            />
            <Select
              label={t('financial.currency', 'Currency')}
              value={filters.currency}
              options={currencyOptions}
              onChange={(event) => updateFilter('currency', event.target.value)}
            />
            <Select
              label={t('financial.referenceType', 'Reference Type')}
              value={filters.referenceType}
              options={referenceTypeOptions}
              onChange={(event) => updateFilter('referenceType', event.target.value)}
            />
            <Select
              label={t('financial.sourceAccount', 'Source Account')}
              value={filters.fromAccount}
              options={accountOptions}
              onChange={(event) => updateFilter('fromAccount', event.target.value)}
            />
            <Select
              label={t('financial.destinationAccount', 'Destination Account')}
              value={filters.toAccount}
              options={accountOptions}
              onChange={(event) => updateFilter('toAccount', event.target.value)}
            />
            <Input
              type="datetime-local"
              label={t('financial.fromDateTime', 'From Date & Time')}
              max={today}
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
            />
            <Input
              type="datetime-local"
              label={t('financial.toDateTime', 'To Date & Time')}
              max={today}
              value={filters.dateTo}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('financial.perPage10', '10 / page'), value: '10' },
                { label: t('financial.perPage25', '25 / page'), value: '25' },
                { label: t('financial.perPage50', '50 / page'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('financial.newest', 'Newest'), value: '-date_time' },
                { label: t('financial.oldest', 'Oldest'), value: 'date_time' },
                { label: t('financial.amountLowHigh', 'Amount: Low to High'), value: 'amount' },
                { label: t('financial.amountHighLow', 'Amount: High to Low'), value: '-amount' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('financial.refresh', 'Refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('financial.clear', 'Clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">
              {t('financial.failedToLoadTransactions', 'Failed to load financial transactions')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <FinancialTransactionTable
            transactions={transactions}
            loading={isLoading}
            onView={(transaction) => navigate(`/finance/transactions/${transaction.id}`)}
            onEdit={(transaction) => navigate(`/finance/transactions/${transaction.id}/edit`)}
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
