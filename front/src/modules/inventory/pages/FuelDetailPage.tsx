import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import FuelDetailCard from '../components/FuelDetailCard';
import { useFuelDetail, useDeleteFuel } from '../queries/useInventoryQueries';
import { PageHeader } from '@/components';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { Fuel } from '../types/inventory';

export default function FuelDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: fuel, isLoading } = useFuelDetail(Number(id));
  const deleteFuel = useDeleteFuel();

  const handleDelete = async (fuelData: Fuel) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: fuelData.fuel_name }));
    if (!confirmed) {
      return;
    }

    try {
      await deleteFuel.mutateAsync(fuelData.id);
      toast.success(t('inventory.fuelDeleted'));
      navigate('/fuel/fuels');
    } catch {
      toast.error(t('inventory.fuelDeleteFailed'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!fuel) {
    return <div>Fuel not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={fuel.fuel_name}
        subtitle={`${fuel.type}`}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: () => navigate('/fuel/fuels'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/fuel/fuels/${fuel.id}/edit`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger' as const,
            onClick: () => handleDelete(fuel),
          },
        ]}
      />

      <FuelDetailCard fuel={fuel} />
    </div>
  );
}
