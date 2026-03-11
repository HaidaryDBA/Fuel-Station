import { z } from 'zod';

const optionalText = z.string().trim().optional().or(z.literal(''));

export const supplierFormSchema = z.object({
  supplier_name: z.string().trim().min(2, 'Supplier name is required'),
  phone: optionalText,
  address: optionalText,
  description: optionalText,
});

export type SupplierFormSchema = z.infer<typeof supplierFormSchema>;

export const purchaseFormSchema = z
  .object({
    fuel: z.number().min(1, 'Fuel is required'),
    supplier: z.number().min(1, 'Supplier is required'),
    partner: z.number().min(1, 'Partner is required'),
    purchase_date: z.string().min(1, 'Purchase date is required'),
    amount_ton: z.number().positive('Amount in ton must be greater than 0'),
    density: z.number().positive('Density must be greater than 0'),
    unit_price: z.number().positive('Unit price must be greater than 0'),
    currency: z.number().min(1, 'Currency is required'),
    paid_currency: z.number().min(1, 'Paid currency is required'),
    invoice_number: optionalText,
    paid_amount: z.number().min(0, 'Paid amount cannot be negative'),
    pay_date: optionalText,
  })
  .refine((data) => data.paid_amount === 0 || !!data.pay_date, {
    path: ['pay_date'],
    message: 'Pay date is required when paid amount is entered',
  })
  .refine((data) => !data.pay_date || data.pay_date >= data.purchase_date, {
    path: ['pay_date'],
    message: 'Pay date cannot be earlier than purchase date',
  });

export type PurchaseFormSchema = z.infer<typeof purchaseFormSchema>;

export const orderPurchaseFormSchema = z.object({
  supplier: z.number().min(1, 'Supplier is required'),
  amount_per_ton: z.number().positive('Amount per ton must be greater than 0'),
  density: z.number().positive('Density must be greater than 0'),
  purchase_price: z.number().positive('Purchase price must be greater than 0'),
  currency: z.number().min(1, 'Currency is required'),
  transport_cost: z.number().min(0, 'Transport cost cannot be negative'),
  tanker: z.number().min(1, 'Tanker is required'),
  date: z.string().min(1, 'Date is required'),
  description: optionalText,
});

export type OrderPurchaseFormSchema = z.infer<typeof orderPurchaseFormSchema>;
