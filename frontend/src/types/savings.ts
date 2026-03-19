export enum SavingsType {
  Savings = 1,
  Stock = 2,
  Gold = 3,
  Crypto = 4,
  RealEstate = 5,
  Fund = 6,
  Other = 7,
}

export enum SavingsStatus {
  Active = 1,
  Matured = 2,
  Closed = 3,
}

export const SAVINGS_TYPE_LABELS: Record<SavingsType, string> = {
  [SavingsType.Savings]:     "Tiết kiệm",
  [SavingsType.Stock]:       "Chứng khoán",
  [SavingsType.Gold]:        "Vàng",
  [SavingsType.Crypto]:      "Crypto",
  [SavingsType.RealEstate]:  "Bất động sản",
  [SavingsType.Fund]:        "Quỹ đầu tư",
  [SavingsType.Other]:       "Khác",
};

export const SAVINGS_STATUS_LABELS: Record<SavingsStatus, string> = {
  [SavingsStatus.Active]:  "Đang hoạt động",
  [SavingsStatus.Matured]: "Đã đáo hạn",
  [SavingsStatus.Closed]:  "Đã đóng",
};

export interface SavingsAccount {
  id: string;
  name: string;
  type: SavingsType;
  typeName: string;
  status: SavingsStatus;
  statusName: string;
  principalAmount: number;
  currentValue: number;
  profitLoss: number;
  interestRate?: number;
  startDate: string;
  maturityDate?: string;
  note?: string;
  createdAt: string;
}

export interface CreateSavingsAccountDto {
  name: string;
  type: SavingsType;
  principalAmount: number;
  interestRate?: number;
  startDate: string;
  maturityDate?: string;
  note?: string;
}

export interface UpdateSavingsAccountDto {
  name: string;
  type: SavingsType;
  interestRate?: number;
  maturityDate?: string;
  note?: string;
}

export interface SavingsHistoryDto {
  id: string;
  savingsAccountId: string;
  transactionType: string;
  amount: number;
  currentValueAfter: number;
  profitLossAfter: number;
  note?: string;
  date: string;
}

export interface SavingsDepositDto {
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsWithdrawDto {
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateSavingsValueDto {
  newValue: number;
  date: string;
  note?: string;
}

export interface SavingsInterestDto {
  amount: number;
  date: string;
  note?: string;
}

export interface CloseAccountDto {
  note?: string;
}

export interface SavingsSummary {
  totalPrincipal: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  activeCount: number;
  totalCount: number;
}
