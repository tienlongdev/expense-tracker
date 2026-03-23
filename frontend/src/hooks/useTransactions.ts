"use client";

import { transactionApi } from "@/lib/transaction-api";
import { Transaction, TransactionQueryParams } from "@/types/transaction";
import { useCallback, useEffect, useState } from "react";

interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useTransactions(query?: Partial<TransactionQueryParams>) {
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? 20;
  const fromDate = query?.fromDate;
  const toDate = query?.toDate;
  const type = query?.type;
  const title = query?.title;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page,
    pageSize,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionApi.getPaged({
        page,
        pageSize,
        fromDate,
        toDate,
        type,
        title,
      });
      setTransactions(data.items);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, fromDate, toDate, type, title]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, loading, error, refetch: fetchTransactions };
}