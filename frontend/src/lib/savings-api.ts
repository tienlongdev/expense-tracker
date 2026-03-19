import {
    CloseAccountDto,
    CreateSavingsAccountDto,
    SavingsAccount,
    SavingsDepositDto,
    SavingsHistoryDto,
    SavingsInterestDto,
    SavingsStatus,
    SavingsSummary,
    SavingsType,
    SavingsWithdrawDto,
    UpdateSavingsAccountDto,
    UpdateSavingsValueDto,
} from "@/types/savings";
import { api } from "./api";

export const savingsApi = {
  getAll:        () => api.get<SavingsAccount[]>("/api/savings"),
  getById:       (id: string) => api.get<SavingsAccount>(`/api/savings/${id}`),
  create:        (dto: CreateSavingsAccountDto) => api.post<SavingsAccount>("/api/savings", dto),
  update:        (id: string, dto: UpdateSavingsAccountDto) =>
    api.put<SavingsAccount>(`/api/savings/${id}`, dto),
  delete:        (id: string) => api.delete<void>(`/api/savings/${id}`),

  getByType:     (type: SavingsType) => api.get<SavingsAccount[]>(`/api/savings/type/${type}`),
  getByStatus:   (status: SavingsStatus) => api.get<SavingsAccount[]>(`/api/savings/status/${status}`),
  getMaturing:   (withinDays = 30) => api.get<SavingsAccount[]>(`/api/savings/maturing?withinDays=${withinDays}`),
  getSummary:    () => api.get<SavingsSummary>("/api/savings/summary"),

  deposit:       (id: string, dto: SavingsDepositDto) =>
    api.post<SavingsHistoryDto>(`/api/savings/${id}/deposit`, dto),
  withdraw:      (id: string, dto: SavingsWithdrawDto) =>
    api.post<SavingsHistoryDto>(`/api/savings/${id}/withdraw`, dto),
  updateValue:   (id: string, dto: UpdateSavingsValueDto) =>
    api.post<SavingsHistoryDto>(`/api/savings/${id}/update-value`, dto),
  addInterest:   (id: string, dto: SavingsInterestDto) =>
    api.post<SavingsHistoryDto>(`/api/savings/${id}/interest`, dto),
  getHistory:    (id: string) => api.get<SavingsHistoryDto[]>(`/api/savings/${id}/history`),
  close:         (id: string, dto?: CloseAccountDto) =>
    api.post<SavingsAccount>(`/api/savings/${id}/close`, dto ?? {}),
};
