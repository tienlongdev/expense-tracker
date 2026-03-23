"use client";

import DayTransactions from "@/components/transaction/DayTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/format";
import { transactionApi } from "@/lib/transaction-api";
import { cn } from "@/lib/utils";
import { Transaction, TransactionType } from "@/types/transaction";
import Icon from "@/components/ui/Icon";
import { useEffect, useState } from "react";

/** Extract "YYYY-MM-DD" from a Date using LOCAL time (avoids UTC offset shift) */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function CalendarPage() {
  const today = new Date();

  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);

  // Single fetch per month — derive everything from this
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoadingMonth(true);
      try {
        const data = await transactionApi.getByMonth(currentYear, currentMonth);
        if (!cancelled) setMonthTransactions(data);
      } catch (err) {
        console.error("getByMonth error:", err);
        if (!cancelled) setMonthTransactions([]);
      } finally {
        if (!cancelled) setLoadingMonth(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [currentYear, currentMonth]);

  // Navigate months — also move selectedDate to 1st of new month
  const prevMonth = () => {
    const newYear  = currentMonth === 1 ? currentYear - 1 : currentYear;
    const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setSelectedDate(new Date(newYear, newMonth - 1, 1));
  };
  const nextMonth = () => {
    const newYear  = currentMonth === 12 ? currentYear + 1 : currentYear;
    const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setSelectedDate(new Date(newYear, newMonth - 1, 1));
  };

  // Build calendar grid
  const firstDay    = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Map per-day summaries — compare date strings directly (no timezone conversion)
  const txByDay: Record<number, { income: number; expense: number }> = {};
  monthTransactions.forEach((t) => {
    const dayNum = parseInt(t.date.substring(8, 10), 10); // "YYYY-MM-DD..." → day
    if (!txByDay[dayNum]) txByDay[dayNum] = { income: 0, expense: 0 };
    if (t.type === TransactionType.Income)  txByDay[dayNum].income  += t.amount;
    if (t.type === TransactionType.Expense) txByDay[dayNum].expense += t.amount;
  });

  // Derive day transactions from month data — ensures perfect consistency with dots
  const selectedDateStr = toLocalDateStr(selectedDate);
  const dayTransactions = monthTransactions.filter((t) =>
    t.date.startsWith(selectedDateStr)
  );

  // Monthly summary
  const monthIncome  = monthTransactions.filter((t) => t.type === TransactionType.Income) .reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === TransactionType.Expense).reduce((s, t) => s + t.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  const isThisMonth =
    currentYear  === today.getFullYear() &&
    currentMonth === today.getMonth() + 1;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lịch giao dịch</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Xem giao dịch theo ngày</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendar ── */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                <Icon name="chevron-left" className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <p className="font-bold text-base">
                  {formatMonth(currentMonth)} {currentYear}
                </p>
                {!loadingMonth && (
                  <div className="flex items-center gap-3 justify-center mt-0.5 text-xs font-semibold tabular-nums">
                    <span className="text-green-500">+{formatCurrency(monthIncome)}</span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="text-red-500">−{formatCurrency(monthExpense)}</span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className={monthBalance >= 0 ? "text-blue-500" : "text-orange-500"}>
                      {monthBalance >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthBalance))}
                    </span>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <Icon name="chevron-right" className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="p-3">
              {/* Day labels */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              {loadingMonth ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array(35).fill(null).map((_, i) => (
                    <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`b-${i}`} className="h-14" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const isToday    = isThisMonth && day === today.getDate();
                    const isSelected =
                      day === selectedDate.getDate() &&
                      currentMonth === selectedDate.getMonth() + 1 &&
                      currentYear  === selectedDate.getFullYear();
                    const hasIncome  = (txByDay[day]?.income  ?? 0) > 0;
                    const hasExpense = (txByDay[day]?.expense ?? 0) > 0;
                    const hasAny     = hasIncome || hasExpense;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, day))}
                        className={cn(
                          "h-14 rounded-xl flex flex-col items-center justify-start pt-1.5 text-sm transition-all duration-150",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md scale-[1.04]"
                            : isToday
                            ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                            : hasAny
                            ? "hover:bg-accent/60 font-medium"
                            : "hover:bg-accent/40 text-muted-foreground"
                        )}
                      >
                        <span className="leading-none">{day}</span>
                        <div className="flex gap-0.5 mt-1.5">
                          {hasIncome && (
                            <span className={cn("w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-green-300" : "bg-green-500")} />
                          )}
                          {hasExpense && (
                            <span className={cn("w-1.5 h-1.5 rounded-full",
                              isSelected ? "bg-red-300" : "bg-red-500")} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 justify-end mt-3 px-1">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Thu nhập
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Chi tiêu
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Day Detail ── */}
        <div>
          <Card>
            <div className="px-5 py-4 border-b border-border/60">
              <p className="font-semibold text-sm">Chi tiết ngày</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDate.toLocaleDateString("vi-VN", {
                  weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
                })}
              </p>
            </div>
            <CardContent className="pt-4">
              <DayTransactions
                date={selectedDate}
                transactions={dayTransactions}
                loading={loadingMonth}
              />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

