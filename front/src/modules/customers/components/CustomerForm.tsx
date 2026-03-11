import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Switch, Textarea } from '@/components/ui';
import { normalizePhoneInput } from '@/utils/normalizeDigits';

import { customerFormSchema } from '../schemas/customerSchema';
import type { CustomerFormValues } from '../types/customer';

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: CustomerFormValues = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  address: '',
  is_active: true,
};

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: CustomerFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('customer.save');
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      first_name: initialValues.first_name || '',
      last_name: initialValues.last_name || '',
      phone: initialValues.phone || '',
      email: initialValues.email || '',
      address: initialValues.address || '',
      is_active: initialValues.is_active ?? true,
    });
  }, [initialValues, reset]);

  const submit = async (values: CustomerFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t('customer.firstName')}
              placeholder={t('customer.firstName')}
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label={t('customer.lastName')}
              placeholder={t('customer.lastName')}
              {...register('last_name')}
              error={errors.last_name?.message}
            />
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              label={t('customer.phone')}
              placeholder={t('customer.phone')}
              {...register('phone', {
                onChange: (event) => {
                  event.target.value = normalizePhoneInput(event.target.value, 10);
                },
              })}
              error={errors.phone?.message}
            />
            <Input label={t('customer.email')} placeholder={t('customer.email')} {...register('email')} error={errors.email?.message} />
            <div className="mt-7">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    label={t('customer.active')}
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            </div>
          </div>

          <Textarea
            label={t('customer.address')}
            placeholder={t('customer.address')}
            rows={3}
            {...register('address')}
            error={errors.address?.message}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('customer.cancel')}
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
