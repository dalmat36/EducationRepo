"use client";

import { Expense } from "@/types/expense";
import ExpenseItem from "./ExpenseItem";
import { Receipt } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export default function ExpenseList({ expenses, onEdit, onDelete, compact }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Receipt size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No expenses found</p>
        <p className="text-slate-400 text-sm mt-1">Add your first expense or adjust your filters</p>
      </div>
    );
  }

  const displayExpenses = compact ? expenses.slice(0, 5) : expenses;

  return (
    <div className="card divide-y divide-slate-100 !p-2">
      {displayExpenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
