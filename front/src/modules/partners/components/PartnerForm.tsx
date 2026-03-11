import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import { normalizePhoneInput } from '@/utils/normalizeDigits';

import { partnerFormSchema } from '../schemas/partnerSchema';
import type { PartnerFormValues } from '../types/partner';

interface PartnerFormProps {
  initialValues?: Partial<PartnerFormValues>;
  onSubmit: (values: PartnerFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: PartnerFormValues = {
  first_name: '',
  father_name: '',
  last_name: '',
  phone: '',
  main_address: '',
  current_address: '',
  date_of_birth: '',
  share_percentage: 0,
  join_date: '',
};

export default function PartnerForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: PartnerFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('partner.save');
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      first_name: initialValues.first_name || '',
      father_name: initialValues.father_name || '',
      last_name: initialValues.last_name || '',
      phone: initialValues.phone || '',
      main_address: initialValues.main_address || '',
      current_address: initialValues.current_address || '',
      date_of_birth: initialValues.date_of_birth || '',
      share_percentage: initialValues.share_percentage ?? 0,
      join_date: initialValues.join_date || '',
    });
  }, [initialValues, reset]);

  const submit = async (values: PartnerFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t('partner.firstName')}
              placeholder={t('partner.firstName')}
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label={t('partner.fatherName')}
              placeholder={t('partner.fatherName')}
              {...register('father_name')}
              error={errors.father_name?.message}
            />
            <Input
              label={t('partner.lastName')}
              placeholder={t('partner.lastName')}
              {...register('last_name')}
              error={errors.last_name?.message}
            />
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              label={t('partner.phone')}
              placeholder={t('partner.phone')}
              {...register('phone', {
                onChange: (event) => {
                  event.target.value = normalizePhoneInput(event.target.value, 10);
                },
              })}
              error={errors.phone?.message}
            />
            <Input
              type="date"
              max={today}
              label={t('partner.dateOfBirth')}
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
            />
            <Input
              type="date"
              max={today}
              label={t('partner.joinDate')}
              {...register('join_date')}
              error={errors.join_date?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              label={t('partner.sharePercentage')}
              {...register('share_percentage', { valueAsNumber: true })}
              error={errors.share_percentage?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Textarea
              label={t('partner.mainAddress')}
              placeholder={t('partner.mainAddress')}
              rows={3}
              {...register('main_address')}
              error={errors.main_address?.message}
            />
            <Textarea
              label={t('partner.currentAddress')}
              placeholder={t('partner.currentAddress')}
              rows={3}
              {...register('current_address')}
              error={errors.current_address?.message}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('partner.cancel')}
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
