import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Checkbox, Input } from '@/components/ui';

import { currencyFormSchema } from '../schemas/financialSchema';
import type { CurrencyFormValues } from '../types/financial';

interface CurrencyFormProps {
  initialValues?: Partial<CurrencyFormValues>;
  onSubmit: (values: CurrencyFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: CurrencyFormValues = {
  name: '',
  code: '',
  symbol: '',
  is_base: false,
  is_active: true,
};

export default function CurrencyForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: CurrencyFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      name: initialValues.name || '',
      code: initialValues.code || '',
      symbol: initialValues.symbol || '',
      is_base: !!initialValues.is_base,
      is_active: initialValues.is_active ?? true,
    });
  }, [initialValues, reset]);

  const submit = async (values: CurrencyFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t('financial.name', 'Name')}
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label={t('financial.code', 'Code')}
              maxLength={3}
              placeholder="USD"
              {...register('code')}
              error={errors.code?.message}
            />
            <Input
              label={t('financial.symbol', 'Symbol')}
              maxLength={8}
              placeholder="$"
              {...register('symbol')}
              error={errors.symbol?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Checkbox
              label={t('financial.isBaseCurrency', 'Is base currency')}
              description={t('financial.baseCurrencyHint', 'Only one currency can be base')}
              {...register('is_base')}
            />
            <Checkbox
              label={t('financial.isActive', 'Is active')}
              description={t('financial.activeCurrencyHint', 'Active currencies are available in forms')}
              {...register('is_active')}
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
