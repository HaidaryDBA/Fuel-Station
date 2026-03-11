import { z } from 'zod';

import { financialTransactionReferenceOptions } from '../constants/financialTransactionOptions';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const currencyCodeRegex = /^[A-Za-z]{3}$/;
const todayIso = new Date().toISOString().slice(0, 10);
const financialTransactionReferenceValues = financialTransactionReferenceOptions.map((option) => option.value) as [
  (typeof financialTransactionReferenceOptions)[number]['value'],
  ...(typeof financialTransactionReferenceOptions)[number]['value'][]
];

export const currencyFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(64, 'Name is too long'),
  code: z
    .string()
    .trim()
    .regex(currencyCodeRegex, 'Code must be exactly 3 letters')
    .transform((value) => value.toUpperCase()),
  symbol: z.string().trim().max(8, 'Symbol is too long'),
  is_base: z.coerce.boolean(),
  is_active: z.coerce.boolean(),
});

export type CurrencyFormSchema = z.infer<typeof currencyFormSchema>;

export const currencyRateFormSchema = z
  .object({
    from_currency: z.coerce.number().min(1, 'From currency is required'),
    to_currency: z.coerce.number().min(1, 'To currency is required'),
    rate_value: z.coerce.number().gt(0, 'Rate must be greater than zero'),
    date: z.string().trim().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  })
  .refine((data) => data.from_currency !== data.to_currency, {
    path: ['to_currency'],
    message: 'From and to currencies must be different',
  });

export type CurrencyRateFormSchema = z.infer<typeof currencyRateFormSchema>;

export const salaryFormSchema = z.object({
  employee: z.coerce.number().min(1, 'Employee is required'),
  year: z.coerce.number().int().min(2000).max(2200),
  month: z.coerce.number().int().min(1).max(12),
  base_salary: z.coerce.number().min(0, 'Base salary cannot be negative'),
  bonus: z.coerce.number().min(0, 'Bonus cannot be negative'),
  net_salary: z.coerce.number().min(0, 'Net salary cannot be negative'),
  pay_date: z.string().trim().regex(dateRegex, 'Pay date must be in YYYY-MM-DD format'),
  description: z.string().trim().max(1000, 'Description is too long'),
});

export type SalaryFormSchema = z.infer<typeof salaryFormSchema>;

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Name is too long'),
  account_type: z.enum(['cash', 'exchange']),
  currency: z.coerce.number().min(1, 'Currency is required'),
  is_active: z.coerce.boolean(),
  description: z.string().trim().max(1000, 'Description is too long'),
});

export type AccountFormSchema = z.infer<typeof accountFormSchema>;

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  currency: z.coerce.number().min(1, 'Currency is required'),
  pay_date: z.string().trim().regex(dateRegex, 'Pay date must be in YYYY-MM-DD format'),
  description: z.string().trim().max(1000, 'Description is too long'),
});

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

export const partnerDebtFormSchema = z.object({
  partner: z.coerce.number().min(1, 'Partner is required'),
  amount_money: z.coerce.number().min(0, 'Amount cannot be negative'),
  currency: z.coerce.number().min(1, 'Currency is required'),
  date: z.string().trim().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  payment_amount: z.coerce.number().min(0, 'Payment amount cannot be negative'),
  currency_paid: z.coerce.number().min(0),
  payment_date: z.string().trim(),
  payment_description: z.string().trim().max(1000, 'Payment description is too long'),
  description: z.string().trim().max(1000, 'Description is too long'),
}).superRefine((data, ctx) => {
  if (data.date > todayIso) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['date'],
      message: 'Date cannot be in the future',
    });
  }

  if (data.payment_date) {
    if (!dateRegex.test(data.payment_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['payment_date'],
        message: 'Paid date must be in YYYY-MM-DD format',
      });
    } else {
      if (data.payment_date > todayIso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payment_date'],
          message: 'Paid date cannot be in the future',
        });
      }
      if (data.payment_date < data.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payment_date'],
          message: 'Paid date cannot be earlier than debt date',
        });
      }
    }
  }

  if (data.payment_amount > 0 && data.currency_paid < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['currency_paid'],
      message: 'Payment currency is required when payment amount is entered',
    });
  }

  if (data.payment_amount > 0 && !data.payment_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['payment_date'],
      message: 'Payment date is required when payment amount is entered',
    });
  }

  if (data.payment_amount === 0 && (data.currency_paid > 0 || !!data.payment_date || !!data.payment_description)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['payment_amount'],
      message: 'Payment amount is required when payment details are entered',
    });
  }

});

export type PartnerDebtFormSchema = z.infer<typeof partnerDebtFormSchema>;

export const financialTransactionFormSchema = z
  .object({
    from_account: z.coerce.number().int().min(0),
    to_account: z.coerce.number().int().min(0),
    transaction_type: z.enum(['deposit', 'withdraw', 'transfer']),
    amount: z.coerce.number().gt(0, 'Amount must be greater than zero'),
    currency: z.coerce.number().min(1, 'Currency is required'),
    date_time: z.string().trim().regex(dateTimeLocalRegex, 'Date and time must be valid'),
    reference_type: z.union([z.literal(''), z.enum(financialTransactionReferenceValues)]),
    reference_id: z
      .union([z.coerce.number().int().positive(), z.nan(), z.null()])
      .transform((value) => (Number.isNaN(value) ? null : value)),
    description: z.string().trim().max(1000, 'Description is too long'),
  })
  .superRefine((data, ctx) => {
    if (data.transaction_type === 'deposit') {
      if (!data.to_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to_account'],
          message: 'Destination account is required for deposits',
        });
      }
      if (data.from_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from_account'],
          message: 'Source account must be empty for deposits',
        });
      }
    }

    if (data.transaction_type === 'withdraw') {
      if (!data.from_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from_account'],
          message: 'Source account is required for withdrawals',
        });
      }
      if (data.to_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to_account'],
          message: 'Destination account must be empty for withdrawals',
        });
      }
    }

    if (data.transaction_type === 'transfer') {
      if (!data.from_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from_account'],
          message: 'Source account is required for transfers',
        });
      }
      if (!data.to_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to_account'],
          message: 'Destination account is required for transfers',
        });
      }
      if (data.from_account && data.to_account && data.from_account === data.to_account) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to_account'],
          message: 'Source and destination accounts must be different',
        });
      }
    }

    if (data.reference_id && !data.reference_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reference_type'],
        message: 'Reference type is required when reference ID is provided',
      });
    }

    const selectedDateTime = new Date(data.date_time);
    if (Number.isNaN(selectedDateTime.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_time'],
        message: 'Date and time must be valid',
      });
      return;
    }

    if (selectedDateTime > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_time'],
        message: 'Transaction date cannot be in the future',
      });
    }
  });

export type FinancialTransactionFormSchema = z.infer<typeof financialTransactionFormSchema>;
