import { Plus, RefreshCw, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';
import {
  Button,
  Card,
  CardContent,
  Input,
  Pagination,
  PaginationInfo,
  Select,
  type SelectOption,
} from '@/components/ui';

import BookTable from '../components/BookTable';
import { useBookFilters } from '../hooks/useBookFilters';
import { useBooksList, useDeleteBook } from '../queries/useBookQueries';
import type { Book } from '../types/book';

export default function BooksListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filters, params, updateFilter, setPage, clearFilters } = useBookFilters();
  const { data, isLoading, isError, refetch } = useBooksList(params);
  const deleteBookMutation = useDeleteBook();

  const books = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const categoryOptions: SelectOption[] = useMemo(() => {
    const categories = Array.from(new Set(books.map((book) => book.category))).sort();
    return categories.map((category) => ({ label: category, value: category }));
  }, [books]);

  const handleDelete = async (book: Book) => {
    const confirmed = window.confirm(t('book.deleteConfirm', { title: book.title }));
    if (!confirmed) {
      return;
    }

    await deleteBookMutation.mutateAsync(book.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('book.title')}
        subtitle={t('book.subtitle')}
        actions={[
          {
            label: t('book.add'),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate('/books/new'),
          },
        ]}
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder={t('book.searchPlaceholder')}
              value={filters.search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
            <Select
              value={filters.category}
              options={categoryOptions}
              placeholder={t('book.allCategories')}
              onChange={(event) => updateFilter('category', event.target.value)}
            />
            <Input
              placeholder={t('book.publisher')}
              value={filters.publisher}
              onChange={(event) => updateFilter('publisher', event.target.value)}
            />
            <Select
              value={filters.rentable}
              options={[
                { label: t('book.allRentableStatuses'), value: '' },
                { label: t('book.rentable'), value: 'true' },
                { label: t('book.notRentable'), value: 'false' },
              ]}
              onChange={(event) => updateFilter('rentable', event.target.value)}
            />
            <Select
              value={filters.inStock}
              options={[
                { label: t('book.allStockStatuses'), value: '' },
                { label: t('book.inStock'), value: 'true' },
                { label: t('book.outOfStock'), value: 'false' },
              ]}
              onChange={(event) => updateFilter('inStock', event.target.value)}
            />
            <Select
              value={String(filters.pageSize)}
              options={[
                { label: t('book.perPage10'), value: '10' },
                { label: t('book.perPage25'), value: '25' },
                { label: t('book.perPage50'), value: '50' },
              ]}
              onChange={(event) => updateFilter('pageSize', Number(event.target.value))}
            />
            <Select
              value={filters.ordering}
              options={[
                { label: t('book.newest'), value: '-created_at' },
                { label: t('book.oldest'), value: 'created_at' },
                { label: t('book.titleAZ'), value: 'title' },
                { label: t('book.titleZA'), value: '-title' },
                { label: t('book.priceLowHigh'), value: 'price' },
                { label: t('book.priceHighLow'), value: '-price' },
              ]}
              onChange={(event) => updateFilter('ordering', event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {t('book.refresh')}
              </Button>
              <Button variant="ghost" onClick={clearFilters}>
                {t('book.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{t('book.failedToLoad')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <BookTable
            books={books}
            loading={isLoading}
            onView={(book) => navigate(`/books/${book.id}`)}
            onEdit={(book) => navigate(`/books/${book.id}/edit`)}
            onDelete={handleDelete}
          />

          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PaginationInfo
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalItems={totalCount}
              />
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
