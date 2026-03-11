import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components';

import PriceDetailCard from '../components/PriceDetailCard';
import { useDeletePriceHistory, usePriceHistoryDetail } from '../queries/useInventoryQueries';
import type { PriceHistory } from '../types/inventory';

export default function PriceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: priceHistory, isLoading } = usePriceHistoryDetail(Number(id));
  const deletePrice = useDeletePriceHistory();

  const handleDelete = async (priceData: PriceHistory) => {
    const confirmed = window.confirm(
      t('inventory.deleteConfirm', { name: priceData.fuel_name || `Fuel #${priceData.fuel}` })
    );
    if (!confirmed) {
      return;
    }

    try {
      await deletePrice.mutateAsync(priceData.id);
      toast.success(t('inventory.priceDeleted'));
      navigate('/fuel/prices');
    } catch {
      toast.error(t('inventory.priceDeleteFailed'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!priceHistory) {
    return <div>Price not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={priceHistory.fuel_name || `Fuel #${priceHistory.fuel}`}
        subtitle={`Price: ${priceHistory.price}`}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: () => navigate('/fuel/prices'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/fuel/prices/${priceHistory.id}/edit`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger' as const,
            onClick: () => handleDelete(priceHistory),
          },
        ]}
      />

      <PriceDetailCard priceHistory={priceHistory} />
    </div>
  );
}
