"use client";

import { transactionApi } from "@/lib/transaction-api";
import { Transaction } from "@/types/transaction";
import { useCallback, useEffect, useState } from "react";

type FilterType = "all" | "date" | "month" | "year";

interface FilterParams {
  type: FilterType;
  date?: string;
  year?: number;
  month?: number;
}

export function useTransactionFilter(params: FilterParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiltered = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Transaction[] = [];

      switch (params.type) {
        case "date":
          if (params.date)
            data = await transactionApi.getByDate(params.date);
          break;
        case "month":
          if (params.year && params.month)
            data = await transactionApi.getByMonth(params.year, params.month);
          break;
        case "year":
          if (params.year)
            data = await transactionApi.getByYear(params.year);
          break;
        default:
          data = await transactionApi.getAll();
      }

      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [params.type, params.date, params.year, params.month]);

  useEffect(() => {
    fetchFiltered();
  }, [fetchFiltered]);

  return { transactions, loading, error, refetch: fetchFiltered };
}