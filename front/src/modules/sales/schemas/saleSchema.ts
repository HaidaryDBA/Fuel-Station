import { z } from 'zod';

export const saleFormSchema = z.object({
  fuel: z.number().min(1, 'Fuel is required'),
  motor: z.number().min(1, 'Motor is required'),
  sale_date: z.string().min(1, 'Sale date is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  unit_price: z.number().positive('Unit price must be greater than zero'),
  currency: z.number().min(1, 'Currency is required'),
});

export const lendingFormSchema = z.object({
  customer: z.number().min(1, 'Customer is required'),
  fuel: z.number().min(1, 'Fuel is required'),
  tank_id: z.number().min(1, 'Tank is required'),
  guarantor: z.number().nullable(),
  sale_date: z.string().min(1, 'Sale date is required'),
  end_date: z.string().min(1, 'End date is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  unit_price: z.number().positive('Unit price must be greater than zero'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  paid_amount: z.number().min(0, 'Paid amount cannot be negative'),
});

export type SaleFormSchema = z.infer<typeof saleFormSchema>;
export type LendingFormSchema = z.infer<typeof lendingFormSchema>;
