import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { api } from "./api";

export const categoryApi = {
  getAll:      () => api.get<Category[]>("/api/category"),
  getById:     (id: string) => api.get<Category>(`/api/category/${id}`),
  getByType:   (type: TransactionType) => api.get<Category[]>(`/api/category/type/${type}`),
  create:      (dto: CreateCategoryDto) => api.post<Category>("/api/category", dto),
  update:      (id: string, dto: UpdateCategoryDto) => api.put<Category>(`/api/category/${id}`, dto),
  delete:      (id: string) => api.delete<void>(`/api/category/${id}`),
};
