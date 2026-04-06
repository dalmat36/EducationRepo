import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr + "-01"), "MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function getLastMonthRange(): { from: string; to: string } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    from: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
    to: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
  };
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getMonthKey(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "yyyy-MM");
  } catch {
    return "";
  }
}
