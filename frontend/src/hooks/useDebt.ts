"use client";
import { debtApi } from "@/lib/debt-api";
import { CreateDebtDto, CreateDebtPaymentDto, Debt, DebtSummary, UpdateDebtDto } from "@/types/debt";
import { useCallback, useEffect, useState } from "react";

export function useDebt() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, sum] = await Promise.all([
        debtApi.getAll(),
        debtApi.getSummary(),
      ]);
      setDebts(data);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu nợ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  const createDebt = async (dto: CreateDebtDto) => {
    const result = await debtApi.create(dto);
    await fetchDebts();
    return result;
  };

  const updateDebt = async (id: string, dto: UpdateDebtDto) => {
    const result = await debtApi.update(id, dto);
    await fetchDebts();
    return result;
  };

  const deleteDebt = async (id: string) => {
    await debtApi.delete(id);
    await fetchDebts();
  };

  const addPayment = async (id: string, dto: CreateDebtPaymentDto) => {
    const result = await debtApi.addPayment(id, dto);
    await fetchDebts();
    return result;
  };

  return {
    debts,
    summary,
    loading,
    error,
    refetch: fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
    addPayment,
  };
}
