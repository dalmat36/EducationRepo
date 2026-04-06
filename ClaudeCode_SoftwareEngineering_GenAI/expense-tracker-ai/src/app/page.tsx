"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import Navigation from "@/components/Navigation";
import SummaryCards from "@/components/SummaryCards";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";
import CloudExportPanel from "@/components/CloudExportPanel";

const MonthlyChart = dynamic(() => import("@/components/charts/MonthlyChart"), { ssr: false });
const CategoryChart = dynamic(() => import("@/components/charts/CategoryChart"), { ssr: false });

export default function DashboardPage() {
  const { expenses, summary, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  function handleEdit(exp: Expense) {
    setEditExpense(exp);
    setShowForm(true);
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

  const recentExpenses = expenses.slice(0, 5);

  return (
    <>
      <Navigation onAddExpense={() => setShowForm(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Your spending at a glance</p>
          </div>
          <button
            onClick={() => setShowExportPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm"
          >
            <UploadCloud size={16} />
            Export & Sync
          </button>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart summary={summary} />
          <CategoryChart summary={summary} />
        </div>

        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
            <Link
              href="/expenses"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ExpenseList
            expenses={recentExpenses}
            onEdit={handleEdit}
            onDelete={deleteExpense}
            compact
          />
        </div>
      </main>

      {showForm && (
        <ExpenseForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          editExpense={editExpense}
        />
      )}

      {showExportPanel && (
        <CloudExportPanel expenses={expenses} onClose={() => setShowExportPanel(false)} />
      )}
    </>
  );
}
