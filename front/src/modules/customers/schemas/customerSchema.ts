import { z } from 'zod';
import { toEnglishDigits } from '@/utils/normalizeDigits';

export const customerFormSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(150, 'First name is too long'),
  last_name: z.string().trim().min(1, 'Last name is required').max(150, 'Last name is too long'),
  phone: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value))
    .refine((value) => !value || /^\d{1,10}$/.test(value), 'Phone must contain at most 10 digits'),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email address'),
  address: z.string().trim(),
  is_active: z.boolean(),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;
