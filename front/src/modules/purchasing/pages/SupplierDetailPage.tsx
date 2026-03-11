import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

import SupplierDetailCard from '../components/SupplierDetailCard';
import { useDeleteSupplier, useSupplierDetail } from '../queries/usePurchasingQueries';
import type { Supplier } from '../types/purchasing';

export default function SupplierDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: supplier, isLoading } = useSupplierDetail(Number(id));
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async (supplierData: Supplier) => {
    const confirmed = window.confirm(
      t('purchasing.deleteSupplierConfirm', 'Delete supplier "{{name}}"?', { name: supplierData.supplier_name })
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteSupplier.mutateAsync(supplierData.id);
      toast.success(t('purchasing.supplierDeleted', 'Supplier deleted successfully'));
      navigate('/purchasing/suppliers');
    } catch {
      toast.error(t('purchasing.supplierDeleteFailed', 'Unable to delete supplier'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.supplier_name}
        subtitle={supplier.phone || t('purchasing.supplierDetails', 'Supplier Details')}
        actions={[
          {
            label: t('purchasing.back', 'Back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/purchasing/suppliers'),
          },
          {
            label: t('purchasing.edit', 'Edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/purchasing/suppliers/${supplier.id}/edit`),
          },
          {
            label: t('purchasing.delete', 'Delete'),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger',
            onClick: () => handleDelete(supplier),
          },
        ]}
      />

      <SupplierDetailCard supplier={supplier} />
    </div>
  );
}
