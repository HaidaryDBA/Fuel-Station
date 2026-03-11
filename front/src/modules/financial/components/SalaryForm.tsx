import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui';

import { salaryFormSchema } from '../schemas/financialSchema';
import type { EmployeeOption, SalaryFormValues } from '../types/financial';

interface SalaryFormProps {
  initialValues?: Partial<SalaryFormValues>;
  employees: EmployeeOption[];
  onSubmit: (values: SalaryFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const now = new Date();

const defaultValues: SalaryFormValues = {
  employee: 0,
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  base_salary: 0,
  bonus: 0,
  net_salary: 0,
  pay_date: now.toISOString().slice(0, 10),
  description: '',
};

export default function SalaryForm({
  initialValues,
  employees,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel: defaultSubmitLabel,
}: SalaryFormProps) {
  const { t } = useTranslation();
  const submitLabel = defaultSubmitLabel || t('financial.save');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues,
  });

  const baseSalary = watch('base_salary');
  const bonus = watch('bonus');
  const selectedEmployeeId = watch('employee');

  useEffect(() => {
    const safeBase = Number.isFinite(baseSalary) ? Number(baseSalary) : 0;
    const safeBonus = Number.isFinite(bonus) ? Number(bonus) : 0;
    setValue('net_salary', safeBase + safeBonus, { shouldValidate: true });
  }, [baseSalary, bonus, setValue]);

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      employee: initialValues.employee ?? 0,
      year: initialValues.year ?? now.getFullYear(),
      month: initialValues.month ?? now.getMonth() + 1,
      base_salary: initialValues.base_salary ?? 0,
      bonus: initialValues.bonus ?? 0,
      net_salary: initialValues.net_salary ?? 0,
      pay_date: initialValues.pay_date || now.toISOString().slice(0, 10),
      description: initialValues.description || '',
    });
  }, [initialValues, reset]);

  const employeeSalaryById = useMemo(() => {
    const entries = employees.map((employee) => {
      const rawSalary = typeof employee.salary === 'number' ? employee.salary : Number(employee.salary || 0);
      const salary = Number.isFinite(rawSalary) ? rawSalary : 0;
      return [employee.id, salary] as const;
    });
    return new Map<number, number>(entries);
  }, [employees]);

  useEffect(() => {
    if (initialValues?.employee) {
      return;
    }

    if (!selectedEmployeeId) {
      return;
    }

    const employeeSalary = employeeSalaryById.get(selectedEmployeeId);
    if (employeeSalary === undefined) {
      return;
    }

    setValue('base_salary', employeeSalary, { shouldValidate: true });
  }, [employeeSalaryById, initialValues?.employee, selectedEmployeeId, setValue]);

  const getEmployeeLabel = (employee: EmployeeOption) => {
    const fullName = (
      employee.display_name
      || `${employee.first_name || ''} ${employee.last_name || ''}`
    ).trim();
    const baseLabel = fullName || `#${employee.id}`;

    if (employee.status && employee.status !== 'active') {
      return `${baseLabel} (${t('financial.inactive', 'Inactive')})`;
    }
    return baseLabel;
  };

  const employeeOptions = employees.map((employee) => ({
    label: getEmployeeLabel(employee),
    value: String(employee.id),
  }));

  const yearOptions = Array.from({ length: 12 }).map((_, index) => {
    const year = now.getFullYear() - 2 + index;
    return { label: String(year), value: String(year) };
  });

  const monthOptions = Array.from({ length: 12 }).map((_, index) => ({
    label: String(index + 1).padStart(2, '0'),
    value: String(index + 1),
  }));

  const submit = async (values: SalaryFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={t('financial.employee')}
              options={employeeOptions}
              {...register('employee', { valueAsNumber: true })}
              error={errors.employee?.message}
            />
            <Select
              label={t('financial.year')}
              options={yearOptions}
              {...register('year', { valueAsNumber: true })}
              error={errors.year?.message}
            />
            <Select
              label={t('financial.month')}
              options={monthOptions}
              {...register('month', { valueAsNumber: true })}
              error={errors.month?.message}
            />
            <Input
              type="date"
              label={t('financial.payDate')}
              {...register('pay_date')}
              error={errors.pay_date?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.baseSalary')}
              {...register('base_salary', { valueAsNumber: true })}
              error={errors.base_salary?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.bonus')}
              {...register('bonus', { valueAsNumber: true })}
              error={errors.bonus?.message}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              label={t('financial.netSalary')}
              {...register('net_salary', { valueAsNumber: true })}
              error={errors.net_salary?.message}
              readOnly
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
