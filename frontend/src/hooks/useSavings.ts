"use client";
import { savingsApi } from "@/lib/savings-api";
import {
    CloseAccountDto,
    CreateSavingsAccountDto,
    SavingsAccount,
    SavingsDepositDto,
    SavingsHistoryDto,
    SavingsInterestDto,
    SavingsSummary,
    SavingsWithdrawDto,
    UpdateSavingsAccountDto,
    UpdateSavingsValueDto,
} from "@/types/savings";
import { useCallback, useEffect, useState } from "react";

export function useSavings() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, sum] = await Promise.all([
        savingsApi.getAll(),
        savingsApi.getSummary(),
      ]);
      setAccounts(data);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu tiết kiệm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const createAccount = async (dto: CreateSavingsAccountDto) => {
    const result = await savingsApi.create(dto);
    await fetchAccounts();
    return result;
  };

  const updateAccount = async (id: string, dto: UpdateSavingsAccountDto) => {
    const result = await savingsApi.update(id, dto);
    await fetchAccounts();
    return result;
  };

  const deleteAccount = async (id: string) => {
    await savingsApi.delete(id);
    await fetchAccounts();
  };

  const deposit = async (id: string, dto: SavingsDepositDto): Promise<SavingsHistoryDto> => {
    const result = await savingsApi.deposit(id, dto);
    await fetchAccounts();
    return result;
  };

  const withdraw = async (id: string, dto: SavingsWithdrawDto): Promise<SavingsHistoryDto> => {
    const result = await savingsApi.withdraw(id, dto);
    await fetchAccounts();
    return result;
  };

  const updateValue = async (id: string, dto: UpdateSavingsValueDto): Promise<SavingsHistoryDto> => {
    const result = await savingsApi.updateValue(id, dto);
    await fetchAccounts();
    return result;
  };

  const addInterest = async (id: string, dto: SavingsInterestDto): Promise<SavingsHistoryDto> => {
    const result = await savingsApi.addInterest(id, dto);
    await fetchAccounts();
    return result;
  };

  const closeAccount = async (id: string, dto?: CloseAccountDto) => {
    const result = await savingsApi.close(id, dto);
    await fetchAccounts();
    return result;
  };

  return {
    accounts,
    summary,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    deposit,
    withdraw,
    updateValue,
    addInterest,
    closeAccount,
  };
}
