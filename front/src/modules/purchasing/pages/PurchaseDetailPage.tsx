import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

import PurchaseDetailCard from '../components/PurchaseDetailCard';
import { useDeletePurchase, usePurchaseDetail } from '../queries/usePurchasingQueries';
import type { Purchase } from '../types/purchasing';

export default function PurchaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: purchase, isLoading } = usePurchaseDetail(Number(id));
  const deletePurchase = useDeletePurchase();

  const handleDelete = async (purchaseData: Purchase) => {
    const confirmed = window.confirm(
      t('purchasing.deletePurchaseConfirm', 'Delete purchase "{{name}}"?', {
        name: purchaseData.invoice_number || `#${purchaseData.purchase_id}`,
      })
    );
    if (!confirmed) {
      return;
    }

    try {
      await deletePurchase.mutateAsync(purchaseData.id);
      toast.success(t('purchasing.purchaseDeleted', 'Purchase deleted successfully'));
      navigate('/purchasing/purchases');
    } catch {
      toast.error(t('purchasing.purchaseDeleteFailed', 'Unable to delete purchase'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!purchase) {
    return <div>Purchase not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={purchase.invoice_number || `Purchase #${purchase.purchase_id}`}
        subtitle={`${purchase.supplier_name} • ${purchase.fuel_name}`}
        actions={[
          {
            label: t('purchasing.back', 'Back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/purchasing/purchases'),
          },
          {
            label: t('purchasing.edit', 'Edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/purchasing/purchases/${purchase.id}/edit`),
          },
          {
            label: t('purchasing.delete', 'Delete'),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger',
            onClick: () => handleDelete(purchase),
          },
        ]}
      />

      <PurchaseDetailCard purchase={purchase} />
    </div>
  );
}
