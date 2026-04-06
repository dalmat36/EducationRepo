export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  dateFrom: string;
  dateTo: string;
}

export interface ExpenseSummary {
  totalAll: number;
  totalThisMonth: number;
  totalLastMonth: number;
  topCategory: Category | null;
  expenseCount: number;
  avgPerExpense: number;
  byCategory: Record<Category, number>;
  monthlyTotals: { month: string; total: number }[];
}

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#6366f1",
  Transportation: "#22c55e",
  Entertainment: "#f59e0b",
  Shopping: "#ec4899",
  Bills: "#ef4444",
  Other: "#8b5cf6",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Other: "📦",
};
