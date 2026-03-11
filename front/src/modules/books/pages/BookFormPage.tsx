import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import BookForm from '../components/BookForm';
import { useBookDetail, useCreateBook, useUpdateBook } from '../queries/useBookQueries';
import type { BookFormValues } from '../types/book';

export default function BookFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parsedId = id ? Number(id) : NaN;
  const isEditMode = Number.isFinite(parsedId);

  const { data: book, isLoading: isLoadingBook, isError } = useBookDetail(parsedId, isEditMode);
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook(parsedId);

  const initialValues: Partial<BookFormValues> | undefined = book
    ? {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        price: Number(book.price),
        rentable: book.rentable,
        quantity: book.quantity,
        available_quantity: book.available_quantity,
        publisher: book.publisher,
        publish_date: book.publish_date || '',
        description: book.description || '',
      }
    : undefined;

  const handleSubmit = async (values: BookFormValues) => {
    if (isEditMode) {
      await updateBookMutation.mutateAsync(values);
      navigate(`/books/${parsedId}`);
      return;
    }

    const createdBook = await createBookMutation.mutateAsync(values);
    navigate(`/books/${createdBook.id}`);
  };

  if (isEditMode && isLoadingBook) {
    return (
      <Card>
        <CardContent>Loading book...</CardContent>
      </Card>
    );
  }

  if (isEditMode && (isError || !book)) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-error">Book not found.</p>
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
        title={isEditMode ? 'Edit Book' : 'Add Book'}
        subtitle={isEditMode ? 'Update book details' : 'Create a new book record'}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/books'),
          },
        ]}
      />

      <BookForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/books')}
        isSubmitting={createBookMutation.isPending || updateBookMutation.isPending}
        submitLabel={isEditMode ? 'Update Book' : 'Create Book'}
      />
    </div>
  );
}

