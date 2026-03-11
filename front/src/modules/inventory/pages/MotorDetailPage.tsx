import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components';

import MotorDetailCard from '../components/MotorDetailCard';
import { useDeleteFuelMotor, useFuelMotorDetail } from '../queries/useInventoryQueries';
import type { FuelMotor } from '../types/inventory';

export default function MotorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: motor, isLoading } = useFuelMotorDetail(Number(id));
  const deleteMotor = useDeleteFuelMotor();

  const handleDelete = async (motorData: FuelMotor) => {
    const confirmed = window.confirm(t('inventory.deleteConfirm', { name: motorData.motor_name }));
    if (!confirmed) {
      return;
    }

    try {
      await deleteMotor.mutateAsync(motorData.id);
      toast.success(t('inventory.motorDeleted'));
      navigate('/fuel/motors');
    } catch {
      toast.error(t('inventory.motorDeleteFailed'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!motor) {
    return <div>Motor not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={motor.motor_name}
        subtitle={motor.fuel_name || `Fuel #${motor.fuel_id}`}
        actions={[
          {
            label: 'Back',
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: 'outline' as const,
            onClick: () => navigate('/fuel/motors'),
          },
          {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => navigate(`/fuel/motors/${motor.id}/edit`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'danger' as const,
            onClick: () => handleDelete(motor),
          },
        ]}
      />

      <MotorDetailCard motor={motor} />
    </div>
  );
}
