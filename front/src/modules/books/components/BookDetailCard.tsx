import type { ReactNode } from 'react';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';

import type { Book } from '../types/book';

interface BookDetailCardProps {
  book: Book;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export default function BookDetailCard({
  book,
  onBack,
  onEdit,
  onDelete,
  deleting = false,
}: BookDetailCardProps) {
  return (
    <Card>
      <CardHeader
        title={book.title}
        subtitle={`${book.author} • ${book.isbn}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              Delete
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem label="Category" value={book.category} />
          <DetailItem label="Publisher" value={book.publisher || 'N/A'} />
          <DetailItem label="Price" value={`$${Number(book.price).toFixed(2)}`} />
          <DetailItem label="Publish Date" value={book.publish_date || 'N/A'} />
          <DetailItem label="Quantity" value={String(book.quantity)} />
          <DetailItem label="Available Quantity" value={String(book.available_quantity)} />
          <DetailItem
            label="Rentable"
            value={
              <Badge variant={book.rentable ? 'primary' : 'default'}>
                {book.rentable ? 'Yes' : 'No'}
              </Badge>
            }
          />
          <DetailItem
            label="Availability"
            value={
              <Badge variant={book.available_quantity > 0 ? 'success' : 'error'}>
                {book.available_quantity > 0 ? 'In stock' : 'Out of stock'}
              </Badge>
            }
          />
          <DetailItem label="Created At" value={new Date(book.created_at).toLocaleString()} />
          <DetailItem label="Updated At" value={new Date(book.updated_at).toLocaleString()} />
        </div>
        <div className="mt-5 rounded-lg border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-medium text-text-primary">Description</p>
          <p className="text-sm text-text-secondary">{book.description || 'No description'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-sm text-text-primary">{value}</div>
    </div>
  );
}


