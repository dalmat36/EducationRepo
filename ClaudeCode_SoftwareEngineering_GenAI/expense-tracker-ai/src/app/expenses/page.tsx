"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import Navigation from "@/components/Navigation";
import FilterBar from "@/components/FilterBar";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";

export default function ExpensesPage() {
  const {
    expenses,
    filteredExpenses,
    filters,
    setFilters,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

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

  return (
    <>
      <Navigation onAddExpense={() => setShowForm(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, filter, and export your expenses</p>
        </div>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          expenses={filteredExpenses}
          resultCount={filteredExpenses.length}
        />

        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={deleteExpense}
        />
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
