import { z } from 'zod';
import { toEnglishDigits } from '@/utils/normalizeDigits';

const weekdaySchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const employeeBaseSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().min(1, 'Last name is required'),
    father_name: z.string().trim().min(1, 'Father name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    phone: z
      .string()
      .trim()
      .transform((value) => toEnglishDigits(value))
      .refine((value) => /^\d{1,10}$/.test(value), 'Phone must contain at most 10 digits'),
    salary: z.coerce.number().min(0, 'Salary cannot be negative'),
    work_days: z.array(weekdaySchema).min(1, 'At least one work day is required'),
    join_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Join date must be in YYYY-MM-DD format'),
    membership_type: z.enum(['permanent', 'contract', 'intern']),
    role: z.enum(['admin', 'manager', 'staff']),
    status: z.enum(['active', 'inactive']),
    picture: z.instanceof(File).optional(),
  });

export const getEmployeeFormSchema = () => employeeBaseSchema;

export type EmployeeFormSchema = z.infer<typeof employeeBaseSchema>;
