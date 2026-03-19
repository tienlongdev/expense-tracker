import {
    CreateDebtDto,
    CreateDebtPaymentDto,
    Debt,
    DebtPayment,
    DebtStatus,
    DebtSummary,
    DebtType,
    UpdateDebtDto,
} from "@/types/debt";
import { api } from "./api";

export const debtApi = {
  getAll:       () => api.get<Debt[]>("/api/debt"),
  getById:      (id: string) => api.get<Debt>(`/api/debt/${id}`),
  create:       (dto: CreateDebtDto) => api.post<Debt>("/api/debt", dto),
  update:       (id: string, dto: UpdateDebtDto) => api.put<Debt>(`/api/debt/${id}`, dto),
  delete:       (id: string) => api.delete<void>(`/api/debt/${id}`),

  getByType:    (type: DebtType) => api.get<Debt[]>(`/api/debt/type/${type}`),
  getByStatus:  (status: DebtStatus) => api.get<Debt[]>(`/api/debt/status/${status}`),
  getOverdue:   () => api.get<Debt[]>("/api/debt/overdue"),
  getSummary:   () => api.get<DebtSummary>("/api/debt/summary"),

  getPayments:  (id: string) => api.get<DebtPayment[]>(`/api/debt/${id}/payments`),
  addPayment:   (id: string, dto: CreateDebtPaymentDto) =>
    api.post<DebtPayment>(`/api/debt/${id}/payments`, dto),
};
