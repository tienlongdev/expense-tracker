"use client";

import { transactionApi } from "@/lib/transaction-api";
import {
    CreateTransactionDto,
    UpdateTransactionDto,
} from "@/types/transaction";
import { useState } from "react";

export function useTransactionMutations(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (dto: CreateTransactionDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await transactionApi.create(dto);
      onSuccess?.();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, dto: UpdateTransactionDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await transactionApi.update(id, dto);
      onSuccess?.();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await transactionApi.delete(id);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    error,
  };
}