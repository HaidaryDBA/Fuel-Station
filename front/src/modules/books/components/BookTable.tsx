import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge, Button, Card, DataTable, type Column } from '@/components/ui';

import type { Book } from '../types/book';

interface BookTableProps {
  books: Book[];
  loading?: boolean;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookTable({ books, loading, onView, onEdit, onDelete }: BookTableProps) {
  const columns: Column<Book>[] = [
    {
      key: 'title',
      label: 'Title',
      header: 'Title',
      sortable: true,
      render: (book) => (
        <div>
          <p className="font-medium text-text-primary">{book.title}</p>
          <p className="text-xs text-text-secondary">{book.isbn}</p>
        </div>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      header: 'Author',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      header: 'Category',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      header: 'Price',
      sortable: true,
      render: (book) => `$${Number(book.price).toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      header: 'Stock',
      render: (book) => (
        <div className="flex items-center gap-2">
          <span>
            {book.available_quantity}/{book.quantity}
          </span>
          {book.available_quantity > 0 ? (
            <Badge variant="success" size="sm" dot>
              In stock
            </Badge>
          ) : (
            <Badge variant="error" size="sm" dot>
              Out of stock
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'rentable',
      label: 'Rentable',
      header: 'Rentable',
      render: (book) => (
        <Badge variant={book.rentable ? 'primary' : 'default'} size="sm">
          {book.rentable ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      header: 'Actions',
      render: (book) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(book)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(book)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(book)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={books}
        loading={loading}
        pagination={false}
        emptyMessage="No books found"
        getRowKey={(book) => book.id}
      />
    </Card>
  );
}

