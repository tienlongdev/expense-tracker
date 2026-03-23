import {
    CreateTransactionDto,
    MonthlyReportDto,
    PagedTransactionResult,
    SummaryDto,
    Transaction,
    TransactionQueryParams,
    UpdateTransactionDto,
} from "@/types/transaction";
import { api } from "./api";

export const transactionApi = {
  // CRUD
  getAll: async () => {
    const pageSize = 100;
    let page = 1;
    let all: Transaction[] = [];

    while (true) {
      const result = await transactionApi.getPaged({ page, pageSize });
      all = all.concat(result.items);

      if (result.totalPages <= page) break;
      page += 1;
    }

    return all;
  },

  getPaged: (query: TransactionQueryParams) => {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("pageSize", String(query.pageSize));

    if (query.fromDate) params.set("fromDate", query.fromDate);
    if (query.toDate) params.set("toDate", query.toDate);
    if (query.type) params.set("type", String(query.type));
    if (query.title?.trim()) params.set("title", query.title.trim());

    return api.get<PagedTransactionResult>(`/api/transaction?${params.toString()}`);
  },

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