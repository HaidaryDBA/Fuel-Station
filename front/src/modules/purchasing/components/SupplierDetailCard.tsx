import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui';

import type { Supplier } from '../types/purchasing';

interface SupplierDetailCardProps {
  supplier: Supplier;
}

export default function SupplierDetailCard({ supplier }: SupplierDetailCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader title={t('purchasing.supplierDetails', 'Supplier Details')} />
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.supplierName', 'Supplier Name')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{supplier.supplier_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.phone', 'Phone')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{supplier.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.address', 'Address')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{supplier.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">{t('purchasing.description', 'Description')}</dt>
            <dd className="mt-1 text-sm text-text-primary">{supplier.description || '-'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
