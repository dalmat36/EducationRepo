"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from "@/types/expense";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (confirmDelete) {
      onDelete(expense.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors group">
      {/* Category dot */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: CATEGORY_COLORS[expense.category] + "20" }}
      >
        {CATEGORY_ICONS[expense.category]}
      </div>

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
          <span
            className="badge text-white"
            style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
          >
            {expense.category}
          </span>
        </div>
      </div>

      {/* Amount */}
      <p className="text-sm font-semibold text-slate-900 shrink-0">
        {formatCurrency(expense.amount)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-colors ${
            confirmDelete
              ? "text-white bg-red-500 hover:bg-red-600"
              : "text-slate-400 hover:text-red-500 hover:bg-red-50"
          }`}
          title={confirmDelete ? "Click again to confirm" : "Delete"}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
