import { z } from 'zod';

export const bookFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    author: z.string().trim().min(1, 'Author is required'),
    isbn: z.string().trim().min(1, 'ISBN is required').max(32, 'ISBN is too long'),
    category: z.string().trim().min(1, 'Category is required'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    rentable: z.boolean(),
    quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
    available_quantity: z
      .coerce
      .number()
      .int()
      .min(0, 'Available quantity cannot be negative'),
    publisher: z.string().trim().max(255, 'Publisher is too long'),
    publish_date: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
        'Publish date must be in YYYY-MM-DD format'
      ),
    description: z.string().trim(),
  })
  .refine((data) => data.available_quantity <= data.quantity, {
    message: 'Available quantity cannot exceed total quantity',
    path: ['available_quantity'],
  });

export type BookFormSchema = z.infer<typeof bookFormSchema>;

