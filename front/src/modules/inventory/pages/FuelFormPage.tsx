import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import FuelForm from '../components/FuelForm';
import { useFuelDetail, useCreateFuel, useUpdateFuel } from '../queries/useInventoryQueries';
import type { FuelFormValues } from '../types/inventory';

export default function FuelFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: fuel, isLoading: isLoadingFuel } = useFuelDetail(Number(id));
  const createFuel = useCreateFuel();
  const updateFuel = useUpdateFuel();

  const isLoading = createFuel.isPending || updateFuel.isPending;

  const handleSubmit = async (data: FuelFormValues) => {
    try {
      if (isEdit && id) {
        await updateFuel.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('inventory.fuelUpdated'));
      } else {
        await createFuel.mutateAsync(data);
        toast.success(t('inventory.fuelCreated'));
      }
      navigate('/fuel/fuels');
    } catch {
      toast.error(t('inventory.fuelSaveFailed'));
    }
  };

  if (isEdit && isLoadingFuel) {
    return <div>Loading...</div>;
  }

  return (
    <FuelForm
      fuel={fuel}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/fuel/fuels')}
      isLoading={isLoading}
    />
  );
}
