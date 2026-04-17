"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import Navigation from "@/components/Navigation";
import ExpenseForm from "@/components/ExpenseForm";

const MonthlyInsights = dynamic(() => import("@/components/MonthlyInsights"), { ssr: false });

export default function InsightsPage() {
  const { expenses, summary, isLoaded, addExpense, updateExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  function handleFormClose() {
    setShowForm(false);
    setEditExpense(null);
  }

  function handleFormSubmit(data: Parameters<typeof addExpense>[0]) {
    if (editExpense) {
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }
  }

  return (
    <>
      <Navigation onAddExpense={() => setShowForm(true)} />
      <main className="max-w-6xl mx-auto">
        <MonthlyInsights expenses={expenses} summary={summary} />
      </main>
      {showForm && (
        <ExpenseForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          editExpense={editExpense}
        />
      )}
    </>
  );
}
