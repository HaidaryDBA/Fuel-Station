import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import type { Salary } from '../types/financial';

interface SalaryTableProps {
  salaries: Salary[];
  loading?: boolean;
  onView: (salary: Salary) => void;
  onEdit: (salary: Salary) => void;
  onDelete: (salary: Salary) => void;
}

const formatAmount = (value: string) => Number(value || 0).toFixed(2);

export default function SalaryTable({ salaries, loading, onView, onEdit, onDelete }: SalaryTableProps) {
  const { t } = useTranslation();

  const columns: Column<Salary>[] = [
    {
      key: 'employee_name',
      label: t('financial.employee'),
      header: t('financial.employee'),
      render: (salary) => salary.employee_name,
    },
    {
      key: 'period',
      label: t('financial.period'),
      header: t('financial.period'),
      render: (salary) => `${salary.year}/${String(salary.month).padStart(2, '0')}`,
    },
    {
      key: 'base_salary',
      label: t('financial.baseSalary'),
      header: t('financial.baseSalary'),
      sortable: true,
      render: (salary) => formatAmount(salary.base_salary),
    },
    {
      key: 'bonus',
      label: t('financial.bonus'),
      header: t('financial.bonus'),
      sortable: true,
      render: (salary) => formatAmount(salary.bonus),
    },
    {
      key: 'net_salary',
      label: t('financial.netSalary'),
      header: t('financial.netSalary'),
      sortable: true,
      render: (salary) => formatAmount(salary.net_salary),
    },
    {
      key: 'pay_date',
      label: t('financial.payDate'),
      header: t('financial.payDate'),
      sortable: true,
      render: (salary) => new Date(salary.pay_date).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('financial.actions'),
      header: t('financial.actions'),
      render: (salary) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(salary)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(salary)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(salary)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card padding="none">
      <DataTable
        columns={columns}
        data={salaries}
        loading={loading}
        pagination={false}
        emptyMessage={t('financial.noSalariesFound')}
        getRowKey={(salary) => salary.id}
      />
    </Card>
  );
}
