"use client";

import TransactionForm from "@/components/transaction/TransactionForm";
import TransactionList from "@/components/transaction/TransactionList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/format";
import {
  CreateTransactionDto,
  Transaction,
  TransactionQueryParams,
  TransactionType,
  UpdateTransactionDto,
} from "@/types/transaction";
import Icon from "@/components/ui/Icon";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useState } from "react";

export default function TransactionsPage() {
  const [query, setQuery] = useState<TransactionQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [titleFilter, setTitleFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { transactions, pagination, loading, error, refetch } = useTransactions(query);
  const { createTransaction, updateTransaction, deleteTransaction, loading: mutating } =
    useTransactionMutations(refetch);

  const [dialogOpen, setDialogOpen]           = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const totalIncome  = transactions
    .filter((t) => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 2)
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApplyFilters = () => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      title: titleFilter.trim() || undefined,
      fromDate: fromDateFilter || undefined,
      toDate: toDateFilter || undefined,
      type:
        typeFilter === "all"
          ? undefined
          : (Number(typeFilter) as TransactionType),
    }));
  };

  const handleClearFilters = () => {
    setTitleFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    setTypeFilter("all");
    setQuery((prev) => ({
      ...prev,
      page: 1,
      title: undefined,
      fromDate: undefined,
      toDate: undefined,
      type: undefined,
    }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleSubmit = async (
    data: CreateTransactionDto | UpdateTransactionDto
  ) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data as UpdateTransactionDto);
    } else {
      await createTransaction(data as CreateTransactionDto);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Giao dịch</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pagination.totalCount} giao dịch
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Icon name="plus" className="w-4 h-4 mr-1.5" />
          Thêm giao dịch
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              placeholder="Tìm theo tên giao dịch"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
            />
          </div>

          <Input
            type="date"
            value={fromDateFilter}
            onChange={(e) => setFromDateFilter(e.target.value)}
          />

          <Input
            type="date"
            value={toDateFilter}
            onChange={(e) => setToDateFilter(e.target.value)}
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="1">Thu nhập</SelectItem>
              <SelectItem value="2">Chi tiêu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={handleClearFilters}>
            Xoá bộ lọc
          </Button>
          <Button onClick={handleApplyFilters} className="rounded-xl px-5">
            Tìm kiếm
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive mt-3">{error}</p>
        )}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Tổng thu"
          value={`+${formatCurrency(totalIncome)}`}
          icon="arrow-down-left"
          theme="emerald"
        />
        <SummaryCard
          title="Tổng chi"
          value={`−${formatCurrency(totalExpense)}`}
          icon="arrow-up-right"
          theme="rose"
        />
        <SummaryCard
          title="Số dư kỳ này"
          value={formatCurrency(totalIncome - totalExpense)}
          icon="wallet"
          theme={totalIncome - totalExpense >= 0 ? "indigo" : "amber"}
        />
      </div>

      {/* List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={mutating}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}