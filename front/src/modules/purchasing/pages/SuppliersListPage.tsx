import { Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import { Button, Card, CardContent, Input, Pagination, PaginationInfo, Select } from '@/components/ui';

import SupplierTable from '../components/SupplierTable';
import { useSupplierFilters } from '../hooks/usePurchasingFilters';
import { useDeleteSupplier, useSuppliersList } from '../queries/usePurchasingQueries';
import type { Supplier } from '../types/purchasing';

export default function SuppliersListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useSupplierFilters();
  const { data, isLoading, isError, refetch } = useSuppliersList(params);
  const deleteSupplierMutation = useDeleteSupplier();

  const suppliers = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const handleDelete = async (supplier: Supplier) => {
    const confirmed = window.confirm(
      t('purchasing.deleteSupplierConfirm', 'Delete supplier "{{name}}"?', { name: supplier.supplier_name })
    );
    if (!confirmed) {
      return;
    }

    await deleteSupplierMutation.mutateAsync(supplier.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('purchasing.suppliersTitle', 'Suppliers')}
        subtitle={t('purchasing.suppliersSubtitle', 'Manage fuel suppliers')}
        actions={[
          {
            label: t('purchasing.addSupplier', 'Add Supplier'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/purchasing/suppliers/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('purchasing.searchSuppliers', 'Search suppliers')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('purchasing.perPage10', '10 per page'), value: '10' },
                { label: t('purchasing.perPage25', '25 per page'), value: '25' },
                { label: t('purchasing.perPage50', '50 per page'), value: '50' },
              ]}
              onChange={(event) => updateFilter('page_size', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('purchasing.nameAZ', 'Name A-Z'), value: 'supplier_name' },
                { label: t('purchasing.nameZA', 'Name Z-A'), value: '-supplier_name' },
                { label: t('purchasing.newest', 'Newest'), value: '-supplier_id' },
                { label: t('purchasing.oldest', 'Oldest'), value: 'supplier_id' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('purchasing.refresh', 'Refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('purchasing.clear', 'Clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('purchasing.failedToLoadSuppliers', 'Failed to load suppliers')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <SupplierTable
            suppliers={suppliers}
            loading={isLoading}
            onView={(supplier) => navigate(`/purchasing/suppliers/${supplier.id}`)}
            onEdit={(supplier) => navigate(`/purchasing/suppliers/${supplier.id}/edit`)}
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

