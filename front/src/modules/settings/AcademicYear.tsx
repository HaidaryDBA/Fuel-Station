import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  CalendarDays,
} from "lucide-react";

import { PageHeader } from "@components/index";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from "@components/ui";
import Input from "@components/ui/Input";
import {
  useAcademicYears,
  useCreateAcademicYear,
  useDeleteAcademicYear,
  useSetActiveAcademicYear,
} from "@/mis/queries/useAcademicYears";
import type { AcademicYear as AcademicYearType, CreateAcademicYearData } from "@/mis/lib/academicYearService";

// Academic Year Schema
const academicYearSchema = z
  .object({
    name: z.string().min(4, "Name is required (e.g., 2024-2025)"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

// Mock data for fallback
const mockAcademicYears: AcademicYearType[] = [
  {
    id: 1,
    name: "2024-2025",
    startDate: "2024-03-21",
    endDate: "2025-03-20",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "2023-2024",
    startDate: "2023-03-21",
    endDate: "2024-03-20",
    isActive: false,
    createdAt: "2023-01-01",
  },
  {
    id: 3,
    name: "2022-2023",
    startDate: "2022-03-21",
    endDate: "2023-03-20",
    isActive: false,
    createdAt: "2022-01-01",
  },
];

export default function AcademicYear() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteYearId, setDeleteYearId] = useState<number | null>(null);
  const [setActiveId, setSetActiveId] = useState<number | null>(null);

  // Fetch academic years
  const {
    data: yearsData,
    isLoading,
    error,
    refetch,
  } = useAcademicYears();

  // Mutations
  const createMutation = useCreateAcademicYear();
  const deleteMutation = useDeleteAcademicYear();
  const setActiveMutation = useSetActiveAcademicYear();

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
    },
  });

  // Use API data or fallback to mock
  const academicYears = yearsData || mockAcademicYears;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle create
  const onSubmit = async (data: AcademicYearFormData) => {
    try {
      await createMutation.mutateAsync(data as CreateAcademicYearData);
      setIsModalOpen(false);
      reset();
    } catch {
      // Error is handled by mutation
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteYearId) return;

    // Find the year to check if it's active
    const yearToDelete = academicYears.find((y) => y.id === deleteYearId);
    if (yearToDelete?.isActive) {
      toast.error(t("settings.cantDeleteActive", "Cannot delete the active academic year"));
      setDeleteYearId(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteYearId);
      setDeleteYearId(null);
    } catch {
      // Error is handled by mutation
    }
  };

  // Handle set active
  const handleSetActive = async () => {
    if (!setActiveId) return;

    try {
      await setActiveMutation.mutateAsync(setActiveId);
      setSetActiveId(null);
    } catch {
      // Error is handled by mutation
    }
  };

  // Loading skeleton
  const TableSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mis.settings.academicYear", "Academic Year")}
        subtitle={t("mis.settings.yearSubtitle", "Manage academic years and set the current active year")}
        actions={[
          {
            label: t("settings.addYear", "Add Year"),
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setIsModalOpen(true),
          },
        ]}
      />

      {/* Academic Years List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-error mb-2">
                {t("settings.yearsLoadError", "Failed to load academic years")}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {t("common.retry", "Retry")}
              </Button>
            </div>
          ) : academicYears.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-sm text-text-secondary mb-4">
                {t("settings.noYears", "No academic years found")}
              </p>
              <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                {t("settings.addFirstYear", "Add First Academic Year")}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {t("settings.yearName", "Year Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {t("settings.startDate", "Start Date")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {t("settings.endDate", "End Date")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {t("settings.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {t("common.actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {academicYears.map((year) => (
                    <tr key={year.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-text-primary">{year.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-text-secondary">{formatDate(year.startDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-text-secondary">{formatDate(year.endDate)}</span>
                      </td>
                      <td className="px-4 py-4">
                        {year.isActive ? (
                          <Badge variant="success" dot>
                            {t("settings.active", "Active")}
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            {t("settings.inactive", "Inactive")}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!year.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSetActiveId(year.id)}
                              leftIcon={<CheckCircle className="h-3 w-3" />}
                            >
                              {t("settings.setActive", "Set Active")}
                            </Button>
                          )}
                          <button
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={t("settings.editYear", "Edit Year")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteYearId(year.id)}
                            className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title={t("settings.deleteYear", "Delete Year")}
                            disabled={year.isActive}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Academic Year Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("settings.addYear", "Add Academic Year")}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t("settings.yearName", "Year Name")}
                placeholder={t("settings.yearNamePlaceholder", "e.g., 2024-2025")}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                type="date"
                label={t("settings.startDate", "Start Date")}
                error={errors.start_date?.message}
                {...register("start_date")}
              />

              <Input
                type="date"
                label={t("settings.endDate", "End Date")}
                error={errors.end_date?.message}
                {...register("end_date")}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" loading={createMutation.isPending}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Active Confirmation Modal */}
      {setActiveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {t("settings.setActiveTitle", "Set Active Year")}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t(
                "settings.setActiveConfirm",
                "Are you sure you want to set this as the active academic year? This will deactivate the current active year."
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSetActiveId(null)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                loading={setActiveMutation.isPending}
                onClick={handleSetActive}
              >
                {t("common.confirm", "Confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteYearId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {t("settings.deleteYearTitle", "Delete Academic Year")}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t(
                "settings.deleteYearConfirm",
                "Are you sure you want to delete this academic year? This action cannot be undone."
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteYearId(null)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {t("common.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
