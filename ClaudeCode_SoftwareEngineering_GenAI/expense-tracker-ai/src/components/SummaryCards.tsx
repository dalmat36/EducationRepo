"use client";

import { TrendingUp, TrendingDown, DollarSign, Tag, Hash } from "lucide-react";
import { ExpenseSummary, CATEGORY_ICONS } from "@/types/expense";
import { formatCurrency } from "@/utils/formatters";

interface SummaryCardsProps {
  summary: ExpenseSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const monthChange =
    summary.totalLastMonth > 0
      ? ((summary.totalThisMonth - summary.totalLastMonth) / summary.totalLastMonth) * 100
      : null;

  const cards = [
    {
      title: "This Month",
      value: formatCurrency(summary.totalThisMonth),
      icon: <DollarSign size={20} />,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      sub:
        monthChange !== null ? (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              monthChange <= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {monthChange <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {Math.abs(monthChange).toFixed(1)}% vs last month
          </span>
        ) : (
          <span className="text-xs text-slate-400">No prior month data</span>
        ),
    },
    {
      title: "Last Month",
      value: formatCurrency(summary.totalLastMonth),
      icon: <TrendingUp size={20} />,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      sub: <span className="text-xs text-slate-400">Previous month total</span>,
    },
    {
      title: "Top Category",
      value: summary.topCategory
        ? `${CATEGORY_ICONS[summary.topCategory]} ${summary.topCategory}`
        : "—",
      icon: <Tag size={20} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      sub: summary.topCategory ? (
        <span className="text-xs text-slate-400">
          {formatCurrency(summary.byCategory[summary.topCategory])} spent
        </span>
      ) : null,
    },
    {
      title: "Total Expenses",
      value: String(summary.expenseCount),
      icon: <Hash size={20} />,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      sub: (
        <span className="text-xs text-slate-400">
          Avg {formatCurrency(summary.avgPerExpense)} each
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-slate-500 font-medium">{card.title}</p>
            <span className={`p-1.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{card.value}</p>
          {card.sub}
        </div>
      ))}
    </div>
  );
}
