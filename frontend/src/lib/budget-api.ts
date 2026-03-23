import {
    Budget,
    BudgetOverview,
    BudgetRecord,
    BudgetYearlyOverview,
    BulkUpsertBudgetDto,
    CopyBudgetDto,
    CopyBudgetResult,
    CreateBudgetDto,
    UpdateBudgetDto,
} from "@/types/budget";
import { api } from "./api";

export const budgetApi = {
  // Raw CRUD records (BudgetDto — no spentAmount)
  getByMonth:        (year: number, month: number) =>
    api.get<BudgetRecord[]>(`/api/budget?year=${year}&month=${month}`),
  getById:           (id: string) => api.get<BudgetRecord>(`/api/budget/${id}`),
  create:            (dto: CreateBudgetDto) => api.post<BudgetRecord>("/api/budget", dto),
  update:            (id: string, dto: UpdateBudgetDto) =>
    api.put<BudgetRecord>(`/api/budget/${id}`, dto),
  delete:            (id: string) => api.delete<void>(`/api/budget/${id}`),

  // Overview with actual spending (BudgetOverviewDto — has spentAmount)
  getOverview:       (year: number, month: number) =>
    api.get<BudgetOverview>(`/api/budget/overview?year=${year}&month=${month}`),
  getYearlyOverview: (year: number) =>
    api.get<BudgetYearlyOverview>(`/api/budget/overview/yearly?year=${year}`),

  bulkUpsert:        (dto: BulkUpsertBudgetDto) =>
    api.post<BudgetRecord[]>("/api/budget/bulk", dto),
  copyFromMonth:     (dto: CopyBudgetDto) =>
    api.post<CopyBudgetResult>("/api/budget/copy", dto),
};
