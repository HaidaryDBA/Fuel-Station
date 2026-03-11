import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import TankStorageDetailCard from '../components/TankStorageDetailCard';
import { useTankStorageDetail, useDeleteTankStorage } from '../queries/useInventoryQueries';
import { PageHeader } from '@/components';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { TankStorage } from '../types/inventory';

export default function TankStorageDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: tank, isLoading } = useTankStorageDetail(Number(id));
  const deleteTankStorage = useDeleteTankStorage();

  const handleDelete = async (tankData: TankStorage) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: `Tank #${tankData.tank_number}` }));
    if (!confirmed) {
      return;
    }

    try {
      await deleteTankStorage.mutateAsync(tankData.id);
      toast.success(t('inventory.tankDeleted'));
      navigate('/fuel/tanks');
    } catch {
      toast.error(t('inventory.tankDeleteFailed'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tank) {
    return <div>Tank storage not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tank #${tank.tank_number}`}
        subtitle={tank.fuel_name || `Fuel #${tank.Fuel}`}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: () => navigate('/fuel/tanks'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/fuel/tanks/${tank.id}/edit`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger' as const,
            onClick: () => handleDelete(tank),
          },
        ]}
      />

      <TankStorageDetailCard tank={tank} />
    </div>
  );
}
