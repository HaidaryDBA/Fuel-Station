import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Card, CardContent, Input, Switch, Textarea } from '@/components/ui';

import { bookFormSchema } from '../schemas/bookSchema';
import type { BookFormValues } from '../types/book';

interface BookFormProps {
  initialValues?: Partial<BookFormValues>;
  onSubmit: (values: BookFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: BookFormValues = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  price: 0,
  rentable: true,
  quantity: 0,
  available_quantity: 0,
  publisher: '',
  publish_date: '',
  description: '',
};

export default function BookForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues, reset]);

  const submit = async (values: BookFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Title" placeholder="Book title" {...register('title')} error={errors.title?.message} />
            <Input label="Author" placeholder="Author name" {...register('author')} error={errors.author?.message} />
            <Input label="ISBN" placeholder="ISBN" {...register('isbn')} error={errors.isbn?.message} />
            <Input
              label="Category"
              placeholder="Category"
              {...register('category')}
              error={errors.category?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label="Price"
              placeholder="0.00"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <Input
              type="text"
              label="Publisher"
              placeholder="Publisher"
              {...register('publisher')}
              error={errors.publisher?.message}
            />
            <Input
              type="number"
              min="0"
              label="Total Quantity"
              {...register('quantity', { valueAsNumber: true })}
              error={errors.quantity?.message}
            />
            <Input
              type="number"
              min="0"
              label="Available Quantity"
              {...register('available_quantity', { valueAsNumber: true })}
              error={errors.available_quantity?.message}
            />
            <Input
              type="date"
              label="Publish Date"
              {...register('publish_date')}
              error={errors.publish_date?.message}
            />
            <Controller
              name="rentable"
              control={control}
              render={({ field }) => (
                <div className="mt-7">
                  <Switch
                    label="Rentable"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                </div>
              )}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Short description"
            rows={4}
            {...register('description')}
            error={errors.description?.message}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

