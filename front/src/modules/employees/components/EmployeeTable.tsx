import { Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, DataTable, type Column } from '@/components/ui';

import EmployeeStatusBadge from './EmployeeStatusBadge';
import type { Employee } from '../types/employee';

interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  statusProcessingId?: number | null;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  loading,
  statusProcessingId,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: EmployeeTableProps) {
  const { t } = useTranslation();
  
  const columns: Column<Employee>[] = [
    {
      key: 'first_name',
      header: t('employee.name'),
      label: t('employee.name'),
      sortable: true,
      render: (employee) => (
        <div className="flex items-center gap-3">
          {employee.picture ? (
            <img
              src={employee.picture}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-border">
              <span className="text-sm font-semibold text-primary">
                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-text-primary">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-text-secondary">{employee.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('employee.phone'),
      label: t('employee.phone'),
      render: (employee) => employee.phone,
    },
    {
      key: 'role',
      header: t('employee.role'),
      label: t('employee.role'),
      sortable: true,
      render: (employee) => employee.role,
    },
    {
      key: 'salary',
      header: t('employee.salary'),
      label: t('employee.salary'),
      sortable: true,
      render: (employee) => `${Number(employee.salary).toFixed(2)}`,
    },
    {
      key: 'status',
      header: t('employee.status'),
      label: t('employee.status'),
      render: (employee) => <EmployeeStatusBadge status={employee.status} />,
    },
    {
      key: 'actions',
      header: t('employee.actions'),
      label: t('employee.actions'),
      render: (employee) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(employee)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(employee)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={statusProcessingId === employee.id}
            onClick={() => onToggleStatus(employee)}
            title={employee.status === 'active' ? t('employee.deactivate') : t('employee.activate')}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(employee)}>
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
        data={employees}
        loading={loading}
        pagination={false}
        emptyMessage={t('employee.noEmployeesFound')}
        getRowKey={(employee) => employee.id}
      />
    </Card>
  );
}
