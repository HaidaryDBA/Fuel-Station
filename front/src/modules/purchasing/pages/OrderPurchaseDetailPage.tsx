import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components';

import OrderPurchaseDetailCard from '../components/OrderPurchaseDetailCard';
import { useDeleteOrderPurchase, useOrderPurchaseDetail } from '../queries/usePurchasingQueries';
import type { OrderPurchase } from '../types/purchasing';

export default function OrderPurchaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: orderPurchase, isLoading } = useOrderPurchaseDetail(Number(id));
  const deleteOrderPurchase = useDeleteOrderPurchase();

  const handleDelete = async (orderPurchaseData: OrderPurchase) => {
    const confirmed = window.confirm(
      t('purchasing.deleteOrderPurchaseConfirm', 'Delete order purchase "{{name}}"?', {
        name: `#${orderPurchaseData.order_id}`,
      })
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteOrderPurchase.mutateAsync(orderPurchaseData.id);
      toast.success(t('purchasing.orderPurchaseDeleted', 'Order purchase deleted successfully'));
      navigate('/purchasing/orders');
    } catch {
      toast.error(t('purchasing.orderPurchaseDeleteFailed', 'Unable to delete order purchase'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!orderPurchase) {
    return <div>Order purchase not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${orderPurchase.order_id}`}
        subtitle={orderPurchase.supplier_name}
        actions={[
          {
            label: t('purchasing.back', 'Back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline',
            onClick: () => navigate('/purchasing/orders'),
          },
          {
            label: t('purchasing.edit', 'Edit'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/purchasing/orders/${orderPurchase.id}/edit`),
          },
          {
            label: t('purchasing.delete', 'Delete'),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger',
            onClick: () => handleDelete(orderPurchase),
          },
        ]}
      />

      <OrderPurchaseDetailCard orderPurchase={orderPurchase} />
    </div>
  );
}
