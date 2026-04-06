"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Expense,
  ExpenseFilters,
  ExpenseSummary,
  Category,
  CATEGORIES,
} from "@/types/expense";
import { loadExpenses, saveExpenses } from "@/utils/storage";
import { getCurrentMonthRange, getLastMonthRange, getMonthKey } from "@/utils/formatters";
import { format, subMonths } from "date-fns";

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultFilters: ExpenseFilters = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveExpenses(expenses);
  }, [expenses, isLoaded]);

  const addExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const expense: Expense = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [expense, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    },
    []
  );

  const updateExpense = useCallback(
    (id: string, data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      setExpenses((prev) =>
        prev
          .map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
          )
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.search && !e.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category !== "All" && e.category !== filters.category) {
        return false;
      }
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
      return true;
    });
  }, [expenses, filters]);

  const summary = useMemo((): ExpenseSummary => {
    const thisMonth = getCurrentMonthRange();
    const lastMonth = getLastMonthRange();

    const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
    const totalThisMonth = expenses
      .filter((e) => e.date >= thisMonth.from && e.date <= thisMonth.to)
      .reduce((s, e) => s + e.amount, 0);
    const totalLastMonth = expenses
      .filter((e) => e.date >= lastMonth.from && e.date <= lastMonth.to)
      .reduce((s, e) => s + e.amount, 0);

    const byCategory = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
      return acc;
    }, {} as Record<Category, number>);

    const topCategory = (Object.entries(byCategory) as [Category, number][]).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] ?? null;

    // Last 6 months
    const monthlyTotals = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const key = format(d, "yyyy-MM");
      const total = expenses
        .filter((e) => getMonthKey(e.date) === key)
        .reduce((s, e) => s + e.amount, 0);
      return { month: format(d, "MMM yy"), total };
    });

    return {
      totalAll,
      totalThisMonth,
      totalLastMonth,
      topCategory,
      expenseCount: expenses.length,
      avgPerExpense: expenses.length ? totalAll / expenses.length : 0,
      byCategory,
      monthlyTotals,
    };
  }, [expenses]);

  return {
    expenses,
    filteredExpenses,
    filters,
    setFilters,
    summary,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
