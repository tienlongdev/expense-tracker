"use client";

import { transactionApi } from "@/lib/transaction-api";
import { MonthlyReportDto } from "@/types/transaction";
import { useCallback, useEffect, useState } from "react";

export function useYearlyReport(year: number) {
  const [report, setReport] = useState<MonthlyReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionApi.getYearlyReport(year);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}