import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui';

import { expenseFormSchema } from '../schemas/financialSchema';
import type { Currency, ExpenseFormValues } from '../types/financial';

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormValues>;
  currencies: Currency[];
  currencyRate?: string;
  amountInBaseCurrency?: string;
  onSubmit: (values: ExpenseFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: ExpenseFormValues = {
  title: '',
  amount: 0,
  currency: 0,
  pay_date: new Date().toISOString().slice(0, 10),
  description: '',
};

export default function ExpenseForm({
  initialValues,
  currencies,
  currencyRate,
  amountInBaseCurrency,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: ExpenseFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      title: initialValues.title || '',
      amount: initialValues.amount ?? 0,
      currency: initialValues.currency ?? 0,
      pay_date: initialValues.pay_date || new Date().toISOString().slice(0, 10),
      description: initialValues.description || '',
    });
  }, [initialValues, reset]);

  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  const submit = async (values: ExpenseFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t('financial.title')}
              {...register('title')}
              error={errors.title?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.amount')}
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
            <Select
              label={t('financial.currency')}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
              error={errors.currency?.message}
            />
            <Input
              type="date"
              label={t('financial.payDate')}
              {...register('pay_date')}
              error={errors.pay_date?.message}
            />
            <Input
              label={t('financial.currencyRate', 'Currency Rate')}
              value={currencyRate || ''}
              readOnly
              hint={t(
                'financial.currencyRateAutoHint',
                'Filled automatically from the latest configured currency rate.'
              )}
            />
            <Input
              label={t('financial.amountInBaseCurrency', 'Amount In Base Currency')}
              value={amountInBaseCurrency || ''}
              readOnly
              hint={t(
                'financial.amountInBaseCurrencyAutoHint',
                'Calculated automatically as Amount x Currency Rate.'
              )}
            />
          </div>

          <Textarea
            label={t('financial.description')}
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('financial.cancel')}
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
