import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Select } from '@/components/ui';

import { currencyRateFormSchema } from '../schemas/financialSchema';
import type { Currency, CurrencyRateFormValues } from '../types/financial';

interface CurrencyRateFormProps {
  initialValues?: Partial<CurrencyRateFormValues>;
  currencies: Currency[];
  onSubmit: (values: CurrencyRateFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const now = new Date();

const defaultValues: CurrencyRateFormValues = {
  from_currency: 0,
  to_currency: 0,
  rate_value: 1,
  date: now.toISOString().slice(0, 10),
};

export default function CurrencyRateForm({
  initialValues,
  currencies,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: CurrencyRateFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyRateFormValues>({
    resolver: zodResolver(currencyRateFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      from_currency: initialValues.from_currency ?? 0,
      to_currency: initialValues.to_currency ?? 0,
      rate_value: initialValues.rate_value ?? 1,
      date: initialValues.date || now.toISOString().slice(0, 10),
    });
  }, [initialValues, reset]);

  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  const submit = async (values: CurrencyRateFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={t('financial.fromCurrency', 'From Currency')}
              options={currencyOptions}
              {...register('from_currency', { valueAsNumber: true })}
              error={errors.from_currency?.message}
            />
            <Select
              label={t('financial.toCurrency', 'To Currency')}
              options={currencyOptions}
              {...register('to_currency', { valueAsNumber: true })}
              error={errors.to_currency?.message}
            />
            <Input
              type="number"
              step="0.000001"
              min="0.000001"
              label={t('financial.rateValue', 'Rate')}
              {...register('rate_value', { valueAsNumber: true })}
              error={errors.rate_value?.message}
            />
            <Input
              type="date"
              label={t('financial.date')}
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

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
