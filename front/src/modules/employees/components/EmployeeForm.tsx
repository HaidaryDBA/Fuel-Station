import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Checkbox, FileUpload, Input, Select, Textarea } from '@/components/ui';
import { normalizePhoneInput } from '@/utils/normalizeDigits';

import { getEmployeeFormSchema } from '../schemas/employeeSchema';
import type { EmployeeFormValues } from '../types/employee';
import {
  employeeMembershipOptions,
  employeeRoleOptions,
  employeeStatusOptions,
  weekdayOptions,
} from '../types/employee';

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormValues>;
  initialPictureUrl?: string | null;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: EmployeeFormValues = {
  first_name: '',
  last_name: '',
  father_name: '',
  address: '',
  phone: '',
  salary: 0,
  work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  join_date: '',
  membership_type: 'permanent',
  role: 'staff',
  status: 'active',
  picture: undefined,
};

export default function EmployeeForm({
  initialValues,
  initialPictureUrl,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: EmployeeFormProps) {
  const { t } = useTranslation();
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(getEmployeeFormSchema()),
    defaultValues,
  });

  const watchedPicture = watch('picture');

  useEffect(() => {
    if (watchedPicture instanceof File) {
      const objectUrl = URL.createObjectURL(watchedPicture);
      setPicturePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPicturePreview(initialPictureUrl ?? null);
    }
  }, [watchedPicture, initialPictureUrl]);

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      ...defaultValues,
      ...initialValues,
      picture: initialValues.picture || undefined,
    });
  }, [initialValues, reset]);

  const submit = async (values: EmployeeFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label={t('employee.firstName')} {...register('first_name')} error={errors.first_name?.message} />
            <Input label={t('employee.lastName')} {...register('last_name')} error={errors.last_name?.message} />
            <Input label={t('employee.fatherName')} {...register('father_name')} error={errors.father_name?.message} />
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              label={t('employee.phone')}
              {...register('phone', {
                onChange: (event) => {
                  event.target.value = normalizePhoneInput(event.target.value, 10);
                },
              })}
              error={errors.phone?.message}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              label={t('employee.salary')}
              {...register('salary', { valueAsNumber: true })}
              error={errors.salary?.message}
            />
            <Input
              type="date"
              label={t('employee.joinDate')}
              {...register('join_date')}
              error={errors.join_date?.message}
            />
            <Controller
              name="membership_type"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('employee.membershipType')}
                  value={field.value}
                  options={employeeMembershipOptions}
                  onChange={(event) =>
                    field.onChange(event.target.value as EmployeeFormValues['membership_type'])
                  }
                  error={errors.membership_type?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('employee.role')}
                  value={field.value}
                  options={employeeRoleOptions}
                  onChange={(event) => field.onChange(event.target.value as EmployeeFormValues['role'])}
                  error={errors.role?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('employee.status')}
                  value={field.value}
                  options={employeeStatusOptions}
                  onChange={(event) => field.onChange(event.target.value as EmployeeFormValues['status'])}
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          <Textarea label={t('customer.address')} rows={3} {...register('address')} error={errors.address?.message} />

          <Controller
            name="work_days"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">{t('employee.workDays')}</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {weekdayOptions.map((day) => {
                    const checked = field.value.includes(day.value);
                    return (
                      <Checkbox
                        key={day.value}
                        label={day.label}
                        checked={checked}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          const next = isChecked
                            ? Array.from(new Set([...field.value, day.value]))
                            : field.value.filter((item) => item !== day.value);
                          field.onChange(next);
                        }}
                      />
                    );
                  })}
                </div>
                {errors.work_days?.message ? (
                  <p className="text-sm text-error">{errors.work_days.message}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="picture"
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">{t('employee.profilePicture')}</p>
                <div className="flex items-start gap-4">
                  {picturePreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={picturePreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <FileUpload
                      accept="image/*"
                      onFilesChange={(files) => {
                        const file = files[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      description={t('employee.uploadPicture')}
                      maxSize={5 * 1024 * 1024}
                    />
                    {value && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange(undefined);
                          setPicturePreview(null);
                        }}
                        className="mt-2 text-sm text-error hover:underline"
                      >
                        {t('employee.removePicture')}
                      </button>
                    )}
                  </div>
                </div>
                {errors.picture?.message && (
                  <p className="text-sm text-error">{errors.picture.message}</p>
                )}
              </div>
            )}
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
