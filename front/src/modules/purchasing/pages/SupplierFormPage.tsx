import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import SupplierForm from '../components/SupplierForm';
import { useCreateSupplier, useSupplierDetail, useUpdateSupplier } from '../queries/usePurchasingQueries';
import type { SupplierFormValues } from '../types/purchasing';

export default function SupplierFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplierDetail(Number(id));
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  const handleSubmit = async (data: SupplierFormValues) => {
    try {
      if (isEdit && id) {
        await updateSupplier.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('purchasing.supplierUpdated', 'Supplier updated successfully'));
      } else {
        await createSupplier.mutateAsync(data);
        toast.success(t('purchasing.supplierCreated', 'Supplier created successfully'));
      }
      navigate('/purchasing/suppliers');
    } catch {
      toast.error(t('purchasing.supplierSaveFailed', 'Unable to save supplier'));
    }
  };

  if (isEdit && isLoadingSupplier) {
    return <div>Loading...</div>;
  }

  return (
    <SupplierForm
      supplier={supplier}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/purchasing/suppliers')}
      isLoading={isLoading}
    />
  );
}

