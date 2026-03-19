import {
    Budget,
    BudgetOverview,
    BudgetYearlyOverview,
    BulkUpsertBudgetDto,
    CopyBudgetDto,
    CopyBudgetResult,
    CreateBudgetDto,
    UpdateBudgetDto,
} from "@/types/budget";
import { api } from "./api";

export const budgetApi = {
  getByMonth:        (year: number, month: number) =>
    api.get<Budget[]>(`/api/budget?year=${year}&month=${month}`),
  getById:           (id: string) => api.get<Budget>(`/api/budget/${id}`),
  create:            (dto: CreateBudgetDto) => api.post<Budget>("/api/budget", dto),
  update:            (id: string, dto: UpdateBudgetDto) =>
    api.put<Budget>(`/api/budget/${id}`, dto),
  delete:            (id: string) => api.delete<void>(`/api/budget/${id}`),

  getOverview:       (year: number, month: number) =>
    api.get<BudgetOverview>(`/api/budget/overview?year=${year}&month=${month}`),
  getYearlyOverview: (year: number) =>
    api.get<BudgetYearlyOverview>(`/api/budget/overview/yearly?year=${year}`),

  bulkUpsert:        (dto: BulkUpsertBudgetDto) =>
    api.post<Budget[]>("/api/budget/bulk", dto),
  copyFromMonth:     (dto: CopyBudgetDto) =>
    api.post<CopyBudgetResult>("/api/budget/copy", dto),
};
