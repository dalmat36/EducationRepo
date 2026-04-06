import { Expense, Category, CATEGORIES } from "@/types/expense";
import { formatDate, formatCurrency, getCurrentMonthRange } from "./formatters";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "json";

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;         // Tailwind bg color class
  textColor: string;      // Tailwind text color class
  badge: string;
  defaultFormat: ExportFormat;
  purpose: string;
  filter: (expenses: Expense[]) => Expense[];
  transform: (expenses: Expense[]) => string;
}

export interface CloudDestination {
  id: string;
  name: string;
  description: string;
  category: "local" | "email" | "cloud" | "share";
  requiresAuth: boolean;
}

export interface ExportHistoryEntry {
  id: string;
  templateId: string;
  templateName: string;
  destination: string;
  format: string;
  timestamp: string;       // ISO string
  recordCount: number;
  fileSizeKb: number;
  status: "success" | "failed" | "pending";
  blob?: string;           // base64 for local re-download
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek: number;       // 0-6, used when frequency=weekly
  dayOfMonth: number;      // 1-28, used when frequency=monthly
  time: string;            // HH:MM
  templateId: string;
  format: ExportFormat;
  destinationId: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const thisMonth = getCurrentMonthRange();

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "All expenses grouped by category with subtotals. Ready for your accountant.",
    icon: "🧾",
    accent: "bg-emerald-50",
    textColor: "text-emerald-700",
    badge: "Tax Ready",
    defaultFormat: "csv",
    purpose: "Annual tax filing",
    filter: (expenses) => [...expenses].sort((a, b) => a.category.localeCompare(b.category) || a.date.localeCompare(b.date)),
    transform: (expenses) => {
      const byCategory: Record<string, Expense[]> = {};
      expenses.forEach((e) => {
        if (!byCategory[e.category]) byCategory[e.category] = [];
        byCategory[e.category].push(e);
      });

      const lines = ["Date,Category,Amount,Description,Subtotal"];
      Object.entries(byCategory).forEach(([cat, exps]) => {
        const subtotal = exps.reduce((s, e) => s + e.amount, 0);
        exps.forEach((e, i) =>
          lines.push(`${formatDate(e.date)},${cat},$${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}",${i === exps.length - 1 ? "$" + subtotal.toFixed(2) : ""}`)
        );
        lines.push(`,,,,`);
      });
      const grand = expenses.reduce((s, e) => s + e.amount, 0);
      lines.push(`,,,,TOTAL: $${grand.toFixed(2)}`);
      return lines.join("\n");
    },
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "This month's expenses with a running total and category breakdown.",
    icon: "📅",
    accent: "bg-indigo-50",
    textColor: "text-indigo-700",
    badge: "This Month",
    defaultFormat: "csv",
    purpose: "Monthly review",
    filter: (expenses) =>
      expenses.filter((e) => e.date >= thisMonth.from && e.date <= thisMonth.to),
    transform: (expenses) => {
      const lines = ["Date,Category,Amount,Description,Running Total"];
      let running = 0;
      expenses.forEach((e) => {
        running += e.amount;
        lines.push(`${formatDate(e.date)},${e.category},$${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}",${formatCurrency(running)}`);
      });
      lines.push(`,,,,MONTH TOTAL: ${formatCurrency(running)}`);
      return lines.join("\n");
    },
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Spending breakdown by category with percentages and insights.",
    icon: "📊",
    accent: "bg-violet-50",
    textColor: "text-violet-700",
    badge: "Analytics",
    defaultFormat: "json",
    purpose: "Spending analysis",
    filter: (expenses) => expenses,
    transform: (expenses) => {
      const total = expenses.reduce((s, e) => s + e.amount, 0);
      const analysis = CATEGORIES.map((cat) => {
        const catExpenses = expenses.filter((e) => e.category === cat);
        const catTotal = catExpenses.reduce((s, e) => s + e.amount, 0);
        return {
          category: cat,
          total: parseFloat(catTotal.toFixed(2)),
          count: catExpenses.length,
          percentage: total > 0 ? parseFloat(((catTotal / total) * 100).toFixed(1)) : 0,
          average: catExpenses.length > 0 ? parseFloat((catTotal / catExpenses.length).toFixed(2)) : 0,
          largest: catExpenses.length > 0 ? Math.max(...catExpenses.map((e) => e.amount)) : 0,
        };
      }).sort((a, b) => b.total - a.total);

      return JSON.stringify({
        generatedAt: new Date().toISOString(),
        totalExpenses: expenses.length,
        grandTotal: parseFloat(total.toFixed(2)),
        period: { from: expenses[expenses.length - 1]?.date ?? null, to: expenses[0]?.date ?? null },
        breakdown: analysis,
      }, null, 2);
    },
  },
  {
    id: "full-backup",
    name: "Full Backup",
    description: "Complete data export with all fields. Use to migrate or restore your data.",
    icon: "🗄️",
    accent: "bg-slate-100",
    textColor: "text-slate-700",
    badge: "All Data",
    defaultFormat: "json",
    purpose: "Data backup & migration",
    filter: (expenses) => expenses,
    transform: (expenses) =>
      JSON.stringify({ exportedAt: new Date().toISOString(), version: "1.0", count: expenses.length, expenses }, null, 2),
  },
];

// ─── Destinations ─────────────────────────────────────────────────────────────

export const CLOUD_DESTINATIONS: CloudDestination[] = [
  { id: "download",      name: "Download",       description: "Save directly to your device",             category: "local",  requiresAuth: false },
  { id: "email",         name: "Email",          description: "Send to any email address",                category: "email",  requiresAuth: false },
  { id: "google-sheets", name: "Google Sheets",  description: "Export to a new or existing spreadsheet",  category: "cloud",  requiresAuth: true  },
  { id: "dropbox",       name: "Dropbox",        description: "Save to your Dropbox folder",              category: "cloud",  requiresAuth: true  },
  { id: "onedrive",      name: "OneDrive",       description: "Sync to Microsoft OneDrive",               category: "cloud",  requiresAuth: true  },
  { id: "share-link",    name: "Share Link",     description: "Generate a shareable link or QR code",     category: "share",  requiresAuth: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateContent(template: ExportTemplate, expenses: Expense[]): { content: string; ext: string; mime: string } {
  const filtered = template.filter(expenses);
  const content = template.transform(filtered);
  const ext = template.defaultFormat;
  const mime = ext === "json" ? "application/json" : "text/csv;charset=utf-8;";
  return { content, ext, mime };
}

export function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateShareableLink(templateId: string, recordCount: number): string {
  const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return `https://app.expensetracker.io/shared/${templateId}/${token}`;
}

export function getFileSizeKb(content: string): number {
  return parseFloat((new TextEncoder().encode(content).length / 1024).toFixed(1));
}

export function buildFilename(templateId: string, ext: string): string {
  const date = format(new Date(), "yyyy-MM-dd");
  return `${templateId}_${date}.${ext}`;
}

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  frequency: "monthly",
  dayOfWeek: 1,
  dayOfMonth: 1,
  time: "08:00",
  templateId: "monthly-summary",
  format: "csv",
  destinationId: "download",
};

export function describeNextExport(config: ScheduleConfig): string {
  if (!config.enabled) return "Scheduling is off";
  const [h, m] = config.time.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);

  if (config.frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (config.frequency === "weekly") {
    const daysUntil = (config.dayOfWeek - now.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
  } else {
    next.setMonth(next.getMonth() + 1, config.dayOfMonth);
  }
  next.setHours(h, m, 0, 0);
  return format(next, "EEE, MMM d 'at' h:mm a");
}
