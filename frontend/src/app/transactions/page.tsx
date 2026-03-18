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
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/format";
import {
    CreateTransactionDto,
    Transaction,
    UpdateTransactionDto,
} from "@/types/transaction";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function TransactionsPage() {
  const { transactions, loading, refetch } = useTransactions();
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
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm">
            {transactions.length} transactions total
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-xl font-bold text-green-500">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Expense</p>
          <p className="text-xl font-bold text-red-500">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className={`text-xl font-bold
            ${totalIncome - totalExpense >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
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