import { Expense } from "@/types/expense";

const STORAGE_KEY = "expense_tracker_data";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    return JSON.parse(raw) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    console.error("Failed to save expenses");
  }
}

// Seed with realistic demo data so the app looks good on first load
function seedData(): Expense[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lm = now.getMonth() === 0 ? "12" : String(now.getMonth()).padStart(2, "0");
  const ly = now.getMonth() === 0 ? y - 1 : y;

  const seed: Omit<Expense, "id" | "createdAt" | "updatedAt">[] = [
    { date: `${y}-${m}-02`, amount: 48.5, category: "Food", description: "Grocery run – Whole Foods" },
    { date: `${y}-${m}-03`, amount: 12.99, category: "Entertainment", description: "Netflix subscription" },
    { date: `${y}-${m}-04`, amount: 65.0, category: "Transportation", description: "Uber – airport" },
    { date: `${y}-${m}-05`, amount: 120.0, category: "Bills", description: "Electric bill" },
    { date: `${y}-${m}-06`, amount: 34.75, category: "Food", description: "Dinner at Bistro 32" },
    { date: `${y}-${m}-07`, amount: 89.99, category: "Shopping", description: "New running shoes" },
    { date: `${y}-${m}-08`, amount: 22.50, category: "Food", description: "Lunch – Thai place" },
    { date: `${y}-${m}-09`, amount: 15.00, category: "Transportation", description: "Parking fees" },
    { date: `${y}-${m}-10`, amount: 9.99, category: "Entertainment", description: "Spotify Premium" },
    { date: `${y}-${m}-11`, amount: 200.00, category: "Bills", description: "Internet bill" },
    { date: `${ly}-${lm}-05`, amount: 55.30, category: "Food", description: "Grocery shopping" },
    { date: `${ly}-${lm}-10`, amount: 45.00, category: "Transportation", description: "Gas fill-up" },
    { date: `${ly}-${lm}-15`, amount: 110.00, category: "Bills", description: "Phone bill" },
    { date: `${ly}-${lm}-18`, amount: 75.00, category: "Shopping", description: "Amazon order" },
    { date: `${ly}-${lm}-22`, amount: 30.00, category: "Entertainment", description: "Movie night" },
  ];

  const expenses: Expense[] = seed.map((s, i) => ({
    ...s,
    id: `seed-${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  saveExpenses(expenses);
  return expenses;
}
