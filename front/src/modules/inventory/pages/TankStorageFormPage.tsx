import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import TankStorageForm from '../components/TankStorageForm';
import { useTankStorageDetail, useFuelsList, useCreateTankStorage, useUpdateTankStorage } from '../queries/useInventoryQueries';
import type { TankStorageFormValues } from '../types/inventory';

export default function TankStorageFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: tank, isLoading: isLoadingTank } = useTankStorageDetail(Number(id));
  const { data: fuelsData } = useFuelsList({ page_size: 100 });
  const fuels = fuelsData?.results ?? [];
  const createTankStorage = useCreateTankStorage();
  const updateTankStorage = useUpdateTankStorage();

  const isLoading = createTankStorage.isPending || updateTankStorage.isPending;

  const handleSubmit = async (data: TankStorageFormValues) => {
    try {
      if (isEdit && id) {
        await updateTankStorage.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('inventory.tankUpdated'));
      } else {
        await createTankStorage.mutateAsync(data);
        toast.success(t('inventory.tankCreated'));
      }
      navigate('/fuel/tanks');
    } catch {
      toast.error(t('inventory.tankSaveFailed'));
    }
  };

  if (isEdit && isLoadingTank) {
    return <div>Loading...</div>;
  }

  return (
    <TankStorageForm
      tank={tank}
      fuels={fuels}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/fuel/tanks')}
      isLoading={isLoading}
    />
  );
}
