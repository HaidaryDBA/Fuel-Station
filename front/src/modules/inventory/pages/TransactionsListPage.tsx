import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import TransactionTable from '../components/TransactionTable';
import { useInventoryTransactionFilters } from '../hooks/useInventoryFilters';
import { useTransactionsList, useDeleteTransaction } from '../queries/useInventoryQueries';
import type { InventoryTransaction } from '../types/inventory';

export default function TransactionsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useInventoryTransactionFilters();
  const { data, isLoading, isError, refetch } = useTransactionsList(params);
  const deleteTransactionMutation = useDeleteTransaction();

  const transactions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (transaction: InventoryTransaction) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: `Transaction #${transaction.id}` }));
    if (!confirmed) {
      return;
    }

    await deleteTransactionMutation.mutateAsync(transaction.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.transactionTitle')}
        subtitle={t('inventory.transactionSubtitle')}
        actions={[
          {
            label: t('inventory.addTransaction', 'Add Transaction'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/fuel/transactions/new'),
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
              value={filters.transactionType}
              options={[
                { label: t('inventory.allStatuses'), value: '' },
                { label: t('inventory.purchaseIn'), value: 'purchase_in' },
                { label: t('inventory.saleOut'), value: 'sale_out' },
                { label: t('inventory.lendingOut'), value: 'lending_out' },
                { label: t('inventory.returnIn'), value: 'return_in' },
                { label: t('inventory.adjustment'), value: 'adjustment' },
              ]}
              onChange={(event) => updateFilter('transactionType', event.target.value)}
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
                { label: t('inventory.newest'), value: '-date_time' },
                { label: t('inventory.oldest'), value: 'date_time' },
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
          <TransactionTable
            transactions={transactions}
            loading={isLoading}
            onView={(transaction) => navigate(`/fuel/transactions/${transaction.id}`)}
            onEdit={(transaction) => navigate(`/fuel/transactions/${transaction.id}/edit`)}
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
