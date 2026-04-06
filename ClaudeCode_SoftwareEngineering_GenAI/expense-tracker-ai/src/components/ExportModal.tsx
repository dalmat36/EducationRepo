"use client";

import { useState, useMemo } from "react";
import { X, Download, FileText, FileJson, Printer, Calendar, Tag, Eye, Loader2 } from "lucide-react";
import { Expense, Category, CATEGORIES } from "@/types/expense";
import { formatDate, formatCurrency, todayString } from "@/utils/formatters";
import {
  ExportFormat,
  filterExpensesForExport,
  exportAsCSV,
  exportAsJSON,
  exportAsPDF,
} from "@/utils/exportAdvanced";

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "csv", label: "CSV", icon: <FileText size={18} />, desc: "Spreadsheet compatible" },
  { id: "json", label: "JSON", icon: <FileJson size={18} />, desc: "Developer friendly" },
  { id: "pdf", label: "PDF", icon: <Printer size={18} />, desc: "Print ready report" },
];

const PREVIEW_LIMIT = 8;

export default function ExportModal({ expenses, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState(todayString());
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [filename, setFilename] = useState(
    `expenses_${new Date().toISOString().slice(0, 10)}`
  );
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const filtered = useMemo(
    () => filterExpensesForExport(expenses, { dateFrom, dateTo, categories: selectedCategories }),
    [expenses, dateFrom, dateTo, selectedCategories]
  );

  const previewRows = filtered.slice(0, PREVIEW_LIMIT);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleAllCategories() {
    setSelectedCategories((prev) => (prev.length === CATEGORIES.length ? [] : [...CATEGORIES]));
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setIsExporting(true);
    // Small delay to show loading state
    await new Promise((r) => setTimeout(r, 400));
    try {
      if (format === "csv") exportAsCSV(filtered, filename);
      else if (format === "json") exportAsJSON(filtered, filename);
      else exportAsPDF(filtered, filename);
    } finally {
      setIsExporting(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Export Expenses</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure and download your expense data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Format selector */}
          <section>
            <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors text-sm font-medium
                    ${format === opt.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  <span className="text-xs font-normal text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
              <Calendar size={14} /> Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </section>

          {/* Category filter */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Tag size={14} /> Categories
              </label>
              <button
                onClick={toggleAllCategories}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedCategories.length === CATEGORIES.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                  return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${selectedCategories.includes(cat) || selectedCategories.length === 0
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
              {selectedCategories.length > 0 && (
                <span className="text-xs text-slate-400 self-center ml-1">
                  {selectedCategories.length} selected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {selectedCategories.length === 0 ? "All categories included" : `${selectedCategories.length} of ${CATEGORIES.length} categories`}
            </p>
          </section>

          {/* Filename */}
          <section>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filename</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value || "expenses")}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm text-slate-400 font-mono">.{format}</span>
            </div>
          </section>

          {/* Summary bar */}
          <div className={`rounded-xl p-4 flex items-center justify-between
            ${filtered.length === 0 ? "bg-amber-50 border border-amber-100" : "bg-slate-50 border border-slate-100"}`}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${filtered.length === 0 ? "text-amber-500" : "text-slate-900"}`}>
                {filtered.length}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {filtered.length === 1 ? "record" : "records"} to export
                </div>
                <div className="text-xs text-slate-500">
                  Total: {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
            {filtered.length > 0 && (
              <button
                onClick={() => setShowPreview((p) => !p)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Eye size={14} />
                {showPreview ? "Hide" : "Preview"}
              </button>
            )}
            {filtered.length === 0 && (
              <span className="text-xs text-amber-600 font-medium">No data matches filters</span>
            )}
          </div>

          {/* Preview table */}
          {showPreview && filtered.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-500">
                  Preview — showing {previewRows.length} of {filtered.length} records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600">Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((e) => (
                      <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{formatDate(e.date)}</td>
                        <td className="px-3 py-2 text-slate-600">{e.category}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{formatCurrency(e.amount)}</td>
                        <td className="px-3 py-2 text-slate-500 truncate max-w-[180px]">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > PREVIEW_LIMIT && (
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
                  + {filtered.length - PREVIEW_LIMIT} more records not shown
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download size={16} />
                Export {filtered.length > 0 ? `${filtered.length} records` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
