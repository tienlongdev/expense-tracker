export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  year: number;
  month: number;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  percentUsed: number;
}

export interface CreateBudgetDto {
  categoryId: string;
  year: number;
  month: number;
  plannedAmount: number;
}

export interface UpdateBudgetDto {
  plannedAmount: number;
}

export interface BudgetOverview {
  year: number;
  month: number;
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  items: Budget[];
}

export interface BudgetYearlyOverview {
  year: number;
  months: BudgetMonthSummary[];
}

export interface BudgetMonthSummary {
  month: number;
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
}

export interface BulkUpsertBudgetItemDto {
  categoryId: string;
  plannedAmount: number;
}

export interface BulkUpsertBudgetDto {
  year: number;
  month: number;
  items: BulkUpsertBudgetItemDto[];
}

export interface CopyBudgetDto {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
  overwrite: boolean;
}

export interface CopyBudgetResult {
  message: string;
  created: number;
  skipped: number;
  overwritten: number;
}
