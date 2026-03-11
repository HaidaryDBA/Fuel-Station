import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, CardHeader, Input, Textarea } from '@/components/ui';

import { supplierFormSchema, type SupplierFormSchema } from '../schemas/purchasingSchema';
import type { Supplier, SupplierFormValues } from '../types/purchasing';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SupplierForm({ supplier, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormSchema>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplier_name: supplier?.supplier_name || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      description: supplier?.description || '',
    },
  });

  return (
    <Card>
      <CardHeader title={supplier ? t('purchasing.editSupplier', 'Edit Supplier') : t('purchasing.addSupplier', 'Add Supplier')} />
      <CardContent>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              supplier_name: data.supplier_name,
              phone: data.phone ?? '',
              address: data.address ?? '',
              description: data.description ?? '',
            })
          )}
          className="space-y-4"
        >
          <Input
            label={t('purchasing.supplierName', 'Supplier Name')}
            placeholder={t('purchasing.supplierNamePlaceholder', 'Enter supplier name')}
            error={errors.supplier_name?.message}
            {...register('supplier_name')}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label={t('purchasing.phone', 'Phone')}
              placeholder={t('purchasing.phonePlaceholder', 'Enter phone number')}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label={t('purchasing.address', 'Address')}
              placeholder={t('purchasing.addressPlaceholder', 'Enter address')}
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
          <Textarea
            label={t('purchasing.description', 'Description')}
            placeholder={t('purchasing.descriptionPlaceholder', 'Additional notes about this supplier')}
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('purchasing.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {supplier ? t('purchasing.update', 'Update') : t('purchasing.create', 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
