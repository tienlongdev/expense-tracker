"use client";

import { transactionApi } from "@/lib/transaction-api";
import { SummaryDto } from "@/types/transaction";
import { useCallback, useEffect, useState } from "react";

type SummaryFilter = "all" | "month" | "year";

interface SummaryParams {
  type: SummaryFilter;
  year?: number;
  month?: number;
}

export function useSummary(params: SummaryParams = { type: "all" }) {
  const [summary, setSummary] = useState<SummaryDto>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: SummaryDto;

      switch (params.type) {
        case "month":
          if (params.year && params.month)
            data = await transactionApi.getSummaryByMonth(
              params.year,
              params.month
            );
          else data = await transactionApi.getSummary();
          break;
        case "year":
          if (params.year)
            data = await transactionApi.getSummaryByYear(params.year);
          else data = await transactionApi.getSummary();
          break;
        default:
          data = await transactionApi.getSummary();
      }

      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [params.type, params.year, params.month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}