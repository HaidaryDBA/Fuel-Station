import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import BookDetailCard from '../components/BookDetailCard';
import { useBookDetail, useDeleteBook } from '../queries/useBookQueries';

export default function BookDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const bookId = Number(id);
  const { data: book, isLoading, isError } = useBookDetail(bookId, Number.isFinite(bookId));
  const deleteBookMutation = useDeleteBook();

  const handleDelete = async () => {
    if (!book) {
      return;
    }

    const confirmed = window.confirm(`Delete "${book.title}"?`);
    if (!confirmed) {
      return;
    }

    await deleteBookMutation.mutateAsync(book.id);
    navigate('/books');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading book details...</CardContent>
      </Card>
    );
  }

  if (isError || !book) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Unable to load book details.</p>
          <Button variant="outline" onClick={() => navigate('/books')}>
            Back to Books
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Details"
        subtitle="View and manage a single book"
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/books'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/books/${book.id}/edit`),
          },
        ]}
      />

      <BookDetailCard
        book={book}
        onBack={() => navigate('/books')}
        onEdit={() => navigate(`/books/${book.id}/edit`)}
        onDelete={handleDelete}
        deleting={deleteBookMutation.isPending}
      />
    </div>
  );
}

