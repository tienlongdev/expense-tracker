"use client";

import DayTransactions from "@/components/transaction/DayTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/format";
import { transactionApi } from "@/lib/transaction-api";
import { cn } from "@/lib/utils";
import { Transaction, TransactionType } from "@/types/transaction";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CalendarPage() {
  const today = new Date();

  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [dayTransactions, setDayTransactions]     = useState<Transaction[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDay, setLoadingDay]     = useState(false);

  // Fetch toàn bộ transactions của tháng
  useEffect(() => {
    const fetchMonth = async () => {
      setLoadingMonth(true);
      try {
        const data = await transactionApi.getByMonth(currentYear, currentMonth);
        setMonthTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonth();
  }, [currentYear, currentMonth]);

  // Fetch transactions của ngày được chọn
  useEffect(() => {
    const fetchDay = async () => {
      setLoadingDay(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const data = await transactionApi.getByDate(dateStr);
        setDayTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDay(false);
      }
    };
    fetchDay();
  }, [selectedDate]);

  // Navigation
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar grid
  const firstDay  = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const blanks    = Array(firstDay).fill(null);
  const days      = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Map transactions per day
  const txByDay: Record<number, { income: number; expense: number }> = {};
  monthTransactions.forEach((t) => {
    const d = new Date(t.date).getDate();
    if (!txByDay[d]) txByDay[d] = { income: 0, expense: 0 };
    if (t.type === TransactionType.Income)  txByDay[d].income  += t.amount;
    if (t.type === TransactionType.Expense) txByDay[d].expense += t.amount;
  });

  // Monthly summary
  const monthIncome  = monthTransactions
    .filter((t) => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm">
          View transactions by date
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Calendar */}
        <div className="lg:col-span-2 space-y-4">

          {/* Month Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <CardTitle className="text-lg">
                    {formatMonth(currentMonth)} {currentYear}
                  </CardTitle>
                  <div className="flex gap-4 text-sm mt-1">
                    <span className="text-green-500">
                      +{formatCurrency(monthIncome)}
                    </span>
                    <span className="text-red-500">
                      -{formatCurrency(monthExpense)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Day Labels */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d}
                    className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              {loadingMonth ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array(35).fill(null).map((_, i) => (
                    <div key={i}
                      className="h-14 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {/* Blank cells */}
                  {blanks.map((_, i) => (
                    <div key={`blank-${i}`} className="h-14" />
                  ))}

                  {/* Day cells */}
                  {days.map((day) => {
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() + 1 &&
                      currentYear === today.getFullYear();

                    const isSelected =
                      day === selectedDate.getDate() &&
                      currentMonth === selectedDate.getMonth() + 1 &&
                      currentYear === selectedDate.getFullYear();

                    const hasIncome  = txByDay[day]?.income  > 0;
                    const hasExpense = txByDay[day]?.expense > 0;

                    return (
                      <button key={day}
                        onClick={() =>
                          setSelectedDate(
                            new Date(currentYear, currentMonth - 1, day)
                          )
                        }
                        className={cn(
                          "h-14 rounded-lg flex flex-col items-center justify-start pt-1.5 text-sm transition-colors relative",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : isToday
                            ? "bg-accent font-bold"
                            : "hover:bg-accent/50"
                        )}>
                        <span>{day}</span>
                        {/* Dot indicators */}
                        <div className="flex gap-0.5 mt-1">
                          {hasIncome && (
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full bg-green-500",
                              isSelected && "bg-green-300"
                            )} />
                          )}
                          {hasExpense && (
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full bg-red-500",
                              isSelected && "bg-red-300"
                            )} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Day Detail */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <DayTransactions
                date={selectedDate}
                transactions={dayTransactions}
                loading={loadingDay}
              />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}