import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import MotorForm from '../components/MotorForm';
import {
  useCreateFuelMotor,
  useFuelMotorDetail,
  useFuelsList,
  useTankStoragesList,
  useUpdateFuelMotor,
} from '../queries/useInventoryQueries';
import type { FuelMotorFormValues } from '../types/inventory';

export default function MotorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const isEdit = !!id;

  const { data: motor, isLoading: isLoadingMotor } = useFuelMotorDetail(Number(id));
  const { data: tanksData } = useTankStoragesList({ page_size: 100 });
  const { data: fuelsData } = useFuelsList({ page_size: 100 });

  const createMotor = useCreateFuelMotor();
  const updateMotor = useUpdateFuelMotor();
  const isLoading = createMotor.isPending || updateMotor.isPending;

  const handleSubmit = async (data: FuelMotorFormValues) => {
    try {
      if (isEdit && id) {
        await updateMotor.mutateAsync({ id: Number(id), payload: data });
        toast.success(t('inventory.motorUpdated'));
      } else {
        await createMotor.mutateAsync(data);
        toast.success(t('inventory.motorCreated'));
      }
      navigate('/fuel/motors');
    } catch {
      toast.error(t('inventory.motorSaveFailed'));
    }
  };

  if (isEdit && isLoadingMotor) {
    return <div>Loading...</div>;
  }

  return (
    <MotorForm
      motor={motor}
      tanks={tanksData?.results ?? []}
      fuels={fuelsData?.results ?? []}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/fuel/motors')}
      isLoading={isLoading}
    />
  );
}
