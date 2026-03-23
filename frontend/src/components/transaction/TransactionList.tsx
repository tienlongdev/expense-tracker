"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit:   (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card ring-1 ring-border/40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-16 bg-muted rounded animate-pulse sm:hidden" />
      </div>
    </div>
  );
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  loading = false,
}: TransactionListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* List container */}
      <div className="space-y-2">
        {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 ring-1 ring-border/40 rounded-2xl bg-card border-dashed">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Icon name="inbox" className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">Không có giao dịch nào phù hợp</p>
          </div>
        )}

        {!loading && transactions.map((transaction) => {
          const isIncome = transaction.type === 1; // 1 = Thu, 2 = Chi
          return (
            <div
              key={transaction.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card ring-1 ring-border/40 hover:ring-border hover:shadow-md transition-all duration-200"
            >
              {/* Left side: Icon + Details */}
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isIncome 
                    ? "bg-gradient-to-br from-emerald-400/20 to-emerald-600/10" 
                    : "bg-gradient-to-br from-rose-400/20 to-rose-600/10"
                }`}>
                  <Icon 
                    name={isIncome ? "arrow-down-left" : "arrow-up-right"} 
                    variant="solid" 
                    className={`w-5 h-5 ${isIncome ? "text-emerald-500" : "text-rose-500"}`} 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" title={transaction.title}>
                    {transaction.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 max-w-full">
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground truncate max-w-[120px]">
                      {transaction.categoryName ?? transaction.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      • {formatDate(transaction.date)}
                    </span>
                  </div>
                  {transaction.note && (
                    <p className="text-[11px] text-muted-foreground/80 truncate mt-1 max-w-[280px]" title={transaction.note}>
                      {transaction.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Right side: Amount + Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-auto w-full mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-border/40 sm:border-0">
                {/* Mobile labels (hidden on desktop) */}
                <span className="text-xs font-medium text-muted-foreground sm:hidden">Số tiền</span>
                
                <div className="flex items-center gap-3">
                  <span className={`font-bold tabular-nums text-sm sm:text-base ${isIncome ? "text-emerald-500" : "text-rose-500"}`}>
                    {isIncome ? "+" : "−"}{formatCurrency(transaction.amount)}
                  </span>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDeleteId === transaction.id ? (
                      <>
                        <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => onDelete(transaction.id)}>
                          Xoá
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setConfirmDeleteId(null)}>
                          Huỷ
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(transaction)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
                        >
                          <Icon name="pencil" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(transaction.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-150"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Container */}
      {!loading && transactions.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 pt-2">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Hiển thị <span className="font-medium text-foreground">{startIndex}-{endIndex}</span> trên <span className="font-medium text-foreground">{totalCount}</span> giao dịch
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-xl" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <Icon name="chevron-left" className="w-4 h-4 mr-1" /> Trước
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <Button variant="outline" size="sm" className="h-8 rounded-xl" disabled={page >= totalPages || totalPages === 0} onClick={() => onPageChange(page + 1)}>
              Sau <Icon name="chevron-right" className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
