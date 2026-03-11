import { apiClient } from "./api";

export class HttpService<T> {
  end_point: string;
  constructor(end_point: string) {
    this.end_point = end_point;
  }

  getAll = async () => {
    const response = await apiClient.get<T[]>(this.end_point);
    return response.data;
  };

  getById = async (id: number) => {
    const response = await apiClient.get<T>(`${this.end_point}/${id}`);
    return response.data;
  };

  create = async (data: Partial<T>) => {
    const response = await apiClient.post<T>(this.end_point + "/", data);
    return response.data;
  };

  update = async (id: number, data: Partial<T>) => {
    const response = await apiClient.put<T>(`${this.end_point}/${id}/`, data);
    return response.data;
  };

  delete = async (id: number) => {
    await apiClient.delete(`${this.end_point}/${id}`);
  };
}
