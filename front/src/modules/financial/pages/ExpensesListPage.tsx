import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import ExpenseTable from '../components/ExpenseTable';
import { useExpenseFilters } from '../hooks/useFinancialFilters';
import { useCurrenciesList, useDeleteExpense, useExpensesList } from '../queries/useFinancialQueries';
import type { Expense } from '../types/financial';

export default function ExpensesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useExpenseFilters();
  const { data, isLoading, isError, refetch } = useExpensesList(params);
  const { data: currencyData } = useCurrenciesList();
  const deleteExpenseMutation = useDeleteExpense();

  const expenses = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const currencyOptions = [
    { label: t('financial.allCurrencies'), value: '' },
    ...(currencyData?.results ?? []).map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: String(currency.id),
    })),
  ];

  const handleDelete = async (expense: Expense) => {
    const confirmed = window.confirm(t('financial.deleteExpenseConfirm', { name: expense.title }));
    if (!confirmed) {
      return;
    }

    await deleteExpenseMutation.mutateAsync(expense.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financial.expensesTitle')}
        subtitle={t('financial.expensesSubtitle')}
        actions={[
          {
            label: t('financial.addExpense'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/finance/expenses/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('financial.searchExpensePlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.currency}
              options={currencyOptions}
              onChange={(event) => updateFilter('currency', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.fromDate')}
              value={filters.payDateFrom}
              onChange={(event) => updateFilter('payDateFrom', event.target.value)}
            />
            <Input
              type="date"
              label={t('financial.toDate')}
              value={filters.payDateTo}
              onChange={(event) => updateFilter('payDateTo', event.target.value)}
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
                { label: t('financial.newest'), value: '-pay_date' },
                { label: t('financial.oldest'), value: 'pay_date' },
                { label: t('financial.amountLowHigh'), value: 'amount' },
                { label: t('financial.amountHighLow'), value: '-amount' },
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
            <p className="text-sm text-error">{t('financial.failedToLoadExpenses')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ExpenseTable
            expenses={expenses}
            loading={isLoading}
            onView={(expense) => navigate(`/finance/expenses/${expense.id}`)}
            onEdit={(expense) => navigate(`/finance/expenses/${expense.id}/edit`)}
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
