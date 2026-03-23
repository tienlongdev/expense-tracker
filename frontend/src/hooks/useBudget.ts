"use client";
import { budgetApi } from "@/lib/budget-api";
import {
    Budget,
    BudgetOverview,
    BudgetRecord,
    BulkUpsertBudgetDto,
    CopyBudgetDto,
    CreateBudgetDto,
    UpdateBudgetDto,
} from "@/types/budget";
import { useCallback, useEffect, useState } from "react";

export function useBudget(year: number, month: number) {
  // `budgets` = categories with spending from the overview (BudgetStatusDto[])
  const [budgets, setBudgets]   = useState<Budget[]>([]);
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  // `records` = raw CRUD records (BudgetDto[]) — for edit/delete by id
  const [records, setRecords]   = useState<BudgetRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rawRecords, ov] = await Promise.all([
        budgetApi.getByMonth(year, month),
        budgetApi.getOverview(year, month),
      ]);
      setRecords(rawRecords);
      setOverview(ov);
      // Use overview.categories as the primary list — has spentAmount
      setBudgets(ov.categories ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ngân sách");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const createBudget = async (dto: CreateBudgetDto) => {
    const result = await budgetApi.create(dto);
    await fetchBudgets();
    return result;
  };

  const updateBudget = async (id: string, dto: UpdateBudgetDto) => {
    const result = await budgetApi.update(id, dto);
    await fetchBudgets();
    return result;
  };

  const deleteBudget = async (id: string) => {
    await budgetApi.delete(id);
    await fetchBudgets();
  };

  const bulkUpsert = async (dto: BulkUpsertBudgetDto) => {
    const result = await budgetApi.bulkUpsert(dto);
    await fetchBudgets();
    return result;
  };

  const copyFromMonth = async (dto: CopyBudgetDto) => {
    const result = await budgetApi.copyFromMonth(dto);
    await fetchBudgets();
    return result;
  };

  return {
    budgets,   // BudgetStatusDto[] — has spentAmount, usedPercent
    records,   // BudgetDto[]      — has id for CRUD
    overview,
    loading,
    error,
    refetch: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    bulkUpsert,
    copyFromMonth,
  };
}
