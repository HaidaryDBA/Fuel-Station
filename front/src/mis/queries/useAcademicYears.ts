import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AcademicYear, CreateAcademicYearData } from "../lib/academicYearService";

const academicYearKeys = {
  all: ["academic-years"] as const,
};

let mockAcademicYears: AcademicYear[] = [
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

const getNextId = () => {
  return mockAcademicYears.reduce((maxId, year) => Math.max(maxId, year.id), 0) + 1;
};

export const useAcademicYears = () => {
  return useQuery<AcademicYear[]>({
    queryKey: academicYearKeys.all,
    queryFn: async () => [...mockAcademicYears],
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAcademicYearData) => {
      const newYear: AcademicYear = {
        id: getNextId(),
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      mockAcademicYears = [newYear, ...mockAcademicYears];
      return newYear;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yearId: number) => {
      mockAcademicYears = mockAcademicYears.filter((year) => year.id !== yearId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
    },
  });
};

export const useSetActiveAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yearId: number) => {
      mockAcademicYears = mockAcademicYears.map((year) => ({
        ...year,
        isActive: year.id === yearId,
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all });
    },
  });
};
