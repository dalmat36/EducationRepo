"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Expense, Category, CATEGORIES, CATEGORY_ICONS } from "@/types/expense";
import { todayString } from "@/utils/formatters";

interface FormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

const defaultForm: FormData = {
  date: todayString(),
  amount: "",
  category: "Food",
  description: "",
};

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  editExpense?: Expense | null;
}

export default function ExpenseForm({ onSubmit, onClose, editExpense }: ExpenseFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (editExpense) {
      setForm({
        date: editExpense.date,
        amount: String(editExpense.amount),
        category: editExpense.category,
        description: editExpense.description,
      });
    } else {
      setForm({ ...defaultForm, date: todayString() });
    }
    setErrors({});
  }, [editExpense]);

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.date) newErrors.date = "Date is required";
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    }
    if (amt > 1_000_000) newErrors.amount = "Amount seems too large";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (form.description.trim().length < 2) newErrors.description = "Description is too short";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      date: form.date,
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category,
      description: form.description.trim(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {editExpense ? "Edit Expense" : "New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date + Amount row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className={`input ${errors.date ? "border-red-400 ring-red-400" : ""}`}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                max={todayString()}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`input ${errors.amount ? "border-red-400 ring-red-400" : ""}`}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.category === cat
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              placeholder="e.g. Grocery run at Whole Foods"
              className={`input ${errors.description ? "border-red-400 ring-red-400" : ""}`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={120}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editExpense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
