import {
    CreateTransactionDto,
    MonthlyReportDto,
    SummaryDto,
    Transaction,
    UpdateTransactionDto,
} from "@/types/transaction";
import { api } from "./api";

export const transactionApi = {
  // CRUD
  getAll: () =>
    api.get<Transaction[]>("/api/transaction"),

  getById: (id: string) =>
    api.get<Transaction>(`/api/transaction/${id}`),

  create: (dto: CreateTransactionDto) =>
    api.post<Transaction>("/api/transaction", dto),

  update: (id: string, dto: UpdateTransactionDto) =>
    api.put<Transaction>(`/api/transaction/${id}`, dto),

  delete: (id: string) =>
    api.delete<void>(`/api/transaction/${id}`),

  // Filter
  getByDate: (date: string) =>
    api.get<Transaction[]>(`/api/transaction/filter/date?date=${date}`),

  getByMonth: (year: number, month: number) =>
    api.get<Transaction[]>(
      `/api/transaction/filter/month?year=${year}&month=${month}`
    ),

  getByYear: (year: number) =>
    api.get<Transaction[]>(`/api/transaction/filter/year?year=${year}`),

  // Summary
  getSummary: () =>
    api.get<SummaryDto>("/api/transaction/summary"),

  getSummaryByMonth: (year: number, month: number) =>
    api.get<SummaryDto>(
      `/api/transaction/summary/month?year=${year}&month=${month}`
    ),

  getSummaryByYear: (year: number) =>
    api.get<SummaryDto>(`/api/transaction/summary/year?year=${year}`),

  // Report
  getYearlyReport: (year: number) =>
    api.get<MonthlyReportDto[]>(
      `/api/transaction/report/yearly?year=${year}`
    ),
};