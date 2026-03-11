import { z } from 'zod';
import { toEnglishDigits } from '@/utils/normalizeDigits';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const todayIso = new Date().toISOString().slice(0, 10);

export const partnerFormSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required').max(64, 'First name is too long'),
    father_name: z.string().trim().min(1, 'Father name is required').max(64, 'Father name is too long'),
    last_name: z.string().trim().min(1, 'Last name is required').max(64, 'Last name is too long'),
    phone: z
      .string()
      .trim()
      .transform((value) => toEnglishDigits(value))
      .refine((value) => /^\d{10}$/.test(value), 'Phone number must be exactly 10 digits'),
    main_address: z.string().trim().min(1, 'Main address is required').max(255, 'Main address is too long'),
    current_address: z
      .string()
      .trim()
      .min(1, 'Current address is required')
      .max(255, 'Current address is too long'),
    date_of_birth: z
      .string()
      .trim()
      .regex(dateRegex, 'Date of birth must be in YYYY-MM-DD format'),
    share_percentage: z.coerce
      .number({ invalid_type_error: 'Share percentage is required' })
      .min(0, 'Share percentage cannot be negative')
      .max(100, 'Share percentage cannot exceed 100'),
    join_date: z
      .string()
      .trim()
      .regex(dateRegex, 'Join date must be in YYYY-MM-DD format'),
  })
  .superRefine((data, ctx) => {
    if (data.date_of_birth >= todayIso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_of_birth'],
        message: 'Date of birth must be in the past',
      });
    }

    if (data.join_date > todayIso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['join_date'],
        message: 'Join date cannot be in the future',
      });
    }

    if (data.join_date < data.date_of_birth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['join_date'],
        message: 'Join date cannot be earlier than date of birth',
      });
    }
  });

export type PartnerFormSchema = z.infer<typeof partnerFormSchema>;
