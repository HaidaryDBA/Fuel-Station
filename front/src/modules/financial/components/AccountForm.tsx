import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Checkbox, Input, Select, Textarea } from '@/components/ui';

import { accountFormSchema } from '../schemas/financialSchema';
import type { AccountFormValues, Currency } from '../types/financial';

interface AccountFormProps {
  initialValues?: Partial<AccountFormValues>;
  currencies: Currency[];
  onSubmit: (values: AccountFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: AccountFormValues = {
  name: '',
  account_type: 'cash',
  currency: 0,
  is_active: true,
  description: '',
};

export default function AccountForm({
  initialValues,
  currencies,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: AccountFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      name: initialValues.name || '',
      account_type: initialValues.account_type || 'cash',
      currency: initialValues.currency ?? 0,
      is_active: initialValues.is_active ?? true,
      description: initialValues.description || '',
    });
  }, [initialValues, reset]);

  const currencyOptions = currencies.map((currency) => ({
    label: `${currency.code} - ${currency.name}`,
    value: String(currency.id),
  }));

  const submit = async (values: AccountFormValues) => {
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
            <Select
              label={t('financial.accountType', 'Account Type')}
              options={[
                { label: t('financial.accountTypeCash', 'Cash'), value: 'cash' },
                { label: t('financial.accountTypeExchange', 'Exchange'), value: 'exchange' },
              ]}
              {...register('account_type')}
              error={errors.account_type?.message}
            />
            <Select
              label={t('financial.currency', 'Currency')}
              options={currencyOptions}
              {...register('currency', { valueAsNumber: true })}
              error={errors.currency?.message}
            />
            <div className="flex items-center pt-6">
              <Checkbox
                label={t('financial.isActive', 'Is active')}
                description={t('financial.activeAccountHint', 'Inactive accounts are hidden in selections')}
                {...register('is_active')}
              />
            </div>
          </div>

          <Textarea
            label={t('financial.description', 'Description')}
            rows={4}
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
