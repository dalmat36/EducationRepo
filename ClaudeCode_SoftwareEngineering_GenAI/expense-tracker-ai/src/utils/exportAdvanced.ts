import { Expense, Category } from "@/types/expense";
import { formatDate } from "./formatters";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateFrom: string;
  dateTo: string;
  categories: Category[];
}

export function filterExpensesForExport(
  expenses: Expense[],
  options: Pick<ExportOptions, "dateFrom" | "dateTo" | "categories">
): Expense[] {
  return expenses.filter((e) => {
    if (options.dateFrom && e.date < options.dateFrom) return false;
    if (options.dateTo && e.date > options.dateTo) return false;
    if (options.categories.length > 0 && !options.categories.includes(e.category)) return false;
    return true;
  });
}

export function exportAsCSV(expenses: Expense[], filename: string): void {
  const headers = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportAsJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    `${filename}.json`
  );
}

export function exportAsPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const rows = expenses
    .map(
      (e) => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${e.category}</td>
        <td style="text-align:right">$${e.amount.toFixed(2)}</td>
        <td>${e.description}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; color: #1e293b; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #6366f1; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
    td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 16px; text-align: right; font-weight: 600; font-size: 14px; color: #1e293b; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Expense Report</h1>
  <p class="meta">Generated ${new Date().toLocaleString()} &middot; ${expenses.length} record${expenses.length !== 1 ? "s" : ""}</p>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Total: $${total.toFixed(2)}</p>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
