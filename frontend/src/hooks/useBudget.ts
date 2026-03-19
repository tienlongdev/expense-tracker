"use client";
import { budgetApi } from "@/lib/budget-api";
import {
    Budget,
    BudgetOverview,
    BulkUpsertBudgetDto,
    CopyBudgetDto,
    CreateBudgetDto,
    UpdateBudgetDto,
} from "@/types/budget";
import { useCallback, useEffect, useState } from "react";

export function useBudget(year: number, month: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, ov] = await Promise.all([
        budgetApi.getByMonth(year, month),
        budgetApi.getOverview(year, month),
      ]);
      setBudgets(data);
      setOverview(ov);
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
    budgets,
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
