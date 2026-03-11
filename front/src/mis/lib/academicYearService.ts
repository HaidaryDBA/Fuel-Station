export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAcademicYearData {
  name: string;
  start_date: string;
  end_date: string;
}
