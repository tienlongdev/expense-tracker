export enum TransactionType {
  Income = 1,
  Expense = 2,
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  typeName: string; // "Income" | "Expense"
  category: string;
  date: string;     // ISO string
  note?: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

export interface SummaryDto {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyReportDto {
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}