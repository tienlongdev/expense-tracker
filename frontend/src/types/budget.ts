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

export interface BudgetStatusItem {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgetId?: string;
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usedPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  isNoBudget: boolean;
}

export interface BudgetOverview {
  year: number;
  month: number;
  totalPlanned: number;
  totalSpent: number;
  totalRemaining: number;
  usedPercent: number;
  overBudgetCount: number;
  nearLimitCount: number;
  onTrackCount: number;
  noBudgetCount: number;
  categories: BudgetStatusItem[];
}

export interface BudgetYearlyOverview {
  year: number;
  months: BudgetMonthSummary[];
}

export interface BudgetMonthSummary {
  month: number;
  totalPlanned: number;
  totalSpent: number;
  totalRemaining: number;
  budgetCount: number;
  overBudgetCount: number;
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
