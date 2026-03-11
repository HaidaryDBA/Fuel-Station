import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import AccountTable from '../components/AccountTable';
import { useAccountFilters } from '../hooks/useFinancialFilters';
import { useAccountsList, useCurrenciesList, useDeleteAccount } from '../queries/useFinancialQueries';
import type { Account } from '../types/financial';

export default function AccountsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useAccountFilters();
  const { data, isLoading, isError, refetch } = useAccountsList(params);
  const { data: currenciesData } = useCurrenciesList();
  const deleteAccountMutation = useDeleteAccount();

  const accounts = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const currencyOptions = [
    { label: t('financial.allCurrencies', 'All currencies'), value: '' },
    ...(currenciesData?.results ?? []).map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: String(currency.id),
    })),
  ];

  const handleDelete = async (account: Account) => {
    const confirmed = window.confirm(
      t('financial.deleteAccountConfirm', 'Delete account "{{name}}"?', { name: account.name })
    );
    if (!confirmed) {
      return;
    }

    await deleteAccountMutation.mutateAsync(account.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.accountsTitle', 'Accounts')}
        subtitle={t('financial.accountsSubtitle', 'Manage finance accounts')}
        actions={[
          {
            label: t('financial.addAccount', 'Add Account'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/accounts/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchAccountPlaceholder', 'Search by account name')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              label={t('financial.accountType', 'Account Type')}
              value={filters.accountType}
              options={[
                { label: t('financial.all', 'All'), value: '' },
                { label: t('financial.accountTypeCash', 'Cash'), value: 'cash' },
                { label: t('financial.accountTypeExchange', 'Exchange'), value: 'exchange' },
              ]}
              onChange={(event) => updateFilter('accountType', event.target.value)}
            />
            <Select
              label={t('financial.currency', 'Currency')}
              value={filters.currency}
              options={currencyOptions}
              onChange={(event) => updateFilter('currency', event.target.value)}
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
                { label: t('financial.nameAZ', 'Name A-Z'), value: 'name' },
                { label: t('financial.nameZA', 'Name Z-A'), value: '-name' },
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
            <p className="text-sm text-error">{t('financial.failedToLoadAccounts', 'Failed to load accounts')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <AccountTable
            accounts={accounts}
            loading={isLoading}
            onEdit={(account) => navigate(`/finance/accounts/${account.id}/edit`)}
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
