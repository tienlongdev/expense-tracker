export enum DebtType {
  Borrowed = 1,
  Lent = 2,
}

export enum DebtStatus {
  Unpaid = 1,
  PartiallyPaid = 2,
  Paid = 3,
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  title: string;
  personName: string;
  amount: number;
  remainingAmount: number;
  paidAmount: number;
  type: DebtType;
  typeName: string;
  status: DebtStatus;
  statusName: string;
  dueDate?: string;
  note?: string;
  createdAt: string;
}

export interface CreateDebtDto {
  title: string;
  personName: string;
  amount: number;
  type: DebtType;
  dueDate?: string;
  note?: string;
}

export interface UpdateDebtDto {
  title: string;
  personName: string;
  amount: number;
  type: DebtType;
  dueDate?: string;
  note?: string;
}

export interface CreateDebtPaymentDto {
  amount: number;
  date: string;
  note?: string;
}

export interface DebtSummary {
  totalBorrowed: number;
  totalLent: number;
  totalBorrowedRemaining: number;
  totalLentRemaining: number;
  overdueCount: number;
}
