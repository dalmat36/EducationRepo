"use client";

import { Search, X, Download, SlidersHorizontal } from "lucide-react";
import { ExpenseFilters, Category, CATEGORIES } from "@/types/expense";
import { exportToCSV } from "@/utils/export";
import { Expense } from "@/types/expense";

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (f: ExpenseFilters) => void;
  expenses: Expense[];
  resultCount: number;
}

export default function FilterBar({ filters, onChange, expenses, resultCount }: FilterBarProps) {
  function reset() {
    onChange({ search: "", category: "All", dateFrom: "", dateTo: "" });
  }

  const isFiltered =
    filters.search || filters.category !== "All" || filters.dateFrom || filters.dateTo;

  return (
    <div className="card space-y-3">
      {/* Top row: search + export */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses…"
            className="input pl-9"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
        <button
          onClick={() => exportToCSV(expenses)}
          className="btn-secondary flex items-center gap-1.5 text-sm whitespace-nowrap"
          title="Export filtered expenses as CSV"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Second row: category + dates + clear */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["All", ...CATEGORIES] as (Category | "All")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filters.category === cat
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            className="input text-xs py-1 w-36"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            title="From date"
          />
          <span className="text-slate-400 text-xs">–</span>
          <input
            type="date"
            className="input text-xs py-1 w-36"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            title="To date"
          />
          {isFiltered && (
            <button onClick={reset} className="text-slate-400 hover:text-slate-600" title="Clear filters">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-400">
        Showing {resultCount} expense{resultCount !== 1 ? "s" : ""}
        {isFiltered ? " (filtered)" : ""}
      </p>
    </div>
  );
}
