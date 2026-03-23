// ── Budget response types matching backend BudgetStatusDto / BudgetOverviewDto ──

/** One category's budget status with actual spending (from /api/budget/overview) */
export interface Budget {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;

  // budget info (null when no budget set)
  budgetId?: string;
  hasBudget: boolean;
  plannedAmount: number;

  // actual spending from transactions
  spentAmount: number;       // actualAmount / đã chi

  // computed by backend
  remainingAmount: number;
  usedPercent: number;       // percentUsed
  isOverBudget: boolean;
  isNearLimit: boolean;
  isNoBudget: boolean;
}

/** Full budget CRUD record (from /api/budget GET) */
export interface BudgetRecord {
  id: string;
  categoryId: string;
  categoryName: string;
  year: number;
  month: number;
  plannedAmount: number;
  note?: string;
}

export interface CreateBudgetDto {
  categoryId: string;
  year: number;
  month: number;
  plannedAmount: number;
  note?: string;
}

export interface UpdateBudgetDto {
  plannedAmount?: number;
  note?: string;
}

/** Overview for a single month (from /api/budget/overview) */
export interface BudgetOverview {
  year: number;
  month: number;
  monthName: string;

  // totals
  totalPlanned: number;
  totalSpent: number;        // backend: totalSpent
  totalRemaining: number;
  usedPercent: number;

  // stats
  overBudgetCount: number;
  nearLimitCount: number;
  onTrackCount: number;
  noBudgetCount: number;

  // per-category breakdown
  categories: Budget[];
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
  usedPercent: number;
  isOverBudget: boolean;
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
