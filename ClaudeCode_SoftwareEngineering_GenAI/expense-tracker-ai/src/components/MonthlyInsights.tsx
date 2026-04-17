"use client";

import { useMemo } from "react";
import { Caveat } from "next/font/google";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Category,
  Expense,
  ExpenseSummary,
} from "@/types/expense";
import { formatCurrency } from "@/utils/formatters";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"] });

const DAILY_BUDGET = 50;
const CATEGORY_SHORT: Partial<Record<Category, string>> = {
  Transportation: "Transport",
};

interface MonthlyInsightsProps {
  expenses: Expense[];
  summary: ExpenseSummary;
}

function computeBudgetStreak(expenses: Expense[]): number {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);
  }
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if ((totals.get(key) ?? 0) > DAILY_BUDGET) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-md px-3 py-2 font-sans">
      <p className="text-xs font-medium text-slate-700">{payload[0].name}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function MonthlyInsights({ expenses, summary }: MonthlyInsightsProps) {
  const topCategories = useMemo(() => {
    return (Object.entries(summary.byCategory) as [Category, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [summary.byCategory]);

  const streak = useMemo(() => computeBudgetStreak(expenses), [expenses]);

  const pieData = CATEGORIES.filter((c) => summary.byCategory[c] > 0).map((c) => ({
    name: c,
    value: summary.byCategory[c],
    fill: CATEGORY_COLORS[c],
  }));

  return (
    <div className={`${caveat.className} flex justify-center py-10 px-4`}>
      <div
        className="relative bg-[#fdf7ea] rounded-md shadow-2xl max-w-md w-full px-8 sm:px-10 py-8 transform -rotate-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 85% 25%, rgba(180,140,90,0.12) 0%, transparent 35%), radial-gradient(ellipse at 80% 55%, rgba(180,140,90,0.10) 0%, transparent 30%)",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.12), inset 0 0 60px rgba(180,140,90,0.05)",
        }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 text-center tracking-tight">
          Monthly Insights
        </h1>
        <div
          className="mt-1 h-2"
          style={{
            backgroundImage:
              "radial-gradient(circle at 4px 4px, #475569 1.2px, transparent 1.4px)",
            backgroundSize: "10px 8px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center",
          }}
        />

        {/* Donut chart */}
        <div className="relative mx-auto mt-6 w-56 h-56">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={96}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#1f2937"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {pieData.map((slice) => (
                    <Cell key={slice.name} fill={slice.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center">
              <span className="text-slate-400 text-lg">no data yet</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white border border-slate-400 rounded-md px-3 py-1 shadow-sm">
              <span className="text-xl text-slate-700">Spending</span>
            </div>
          </div>
          <span className="absolute -right-4 bottom-8 text-base text-slate-500 italic rotate-[-6deg]">
            Donut chart!
          </span>
        </div>

        {/* Top 3 category list */}
        <div className="relative mt-8">
          <div className="space-y-3">
            {topCategories.length === 0 && (
              <p className="text-slate-400 text-xl text-center">Add expenses to see your top categories.</p>
            )}
            {topCategories.map(([cat, total]) => (
              <div key={cat} className="flex items-center gap-3">
                <span
                  className="block w-1.5 h-7 rounded-sm"
                  style={{ background: CATEGORY_COLORS[cat] }}
                />
                <span className="text-2xl" aria-hidden>
                  {CATEGORY_ICONS[cat]}
                </span>
                <span className="text-2xl text-slate-800">
                  {CATEGORY_SHORT[cat] ?? cat}: {formatCurrency(total)}
                </span>
              </div>
            ))}
          </div>
          {topCategories.length > 0 && (
            <div className="absolute -right-1 -top-2 flex flex-col items-end">
              <span className="text-lg italic text-slate-500">Top 3!</span>
              <span className="text-2xl text-slate-500 leading-none mt-1">↓</span>
            </div>
          )}
        </div>

        {/* Budget streak */}
        <div className="mt-8 border-[2.5px] border-dashed border-slate-400 rounded-2xl px-6 py-5 text-center">
          <h2 className="text-2xl text-slate-700">Budget Streak</h2>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="text-6xl font-bold text-emerald-600 leading-none">{streak}</span>
            <span
              className="inline-block w-14 h-6 rounded-full border-2 border-slate-400"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-40deg, transparent 0 3px, #94a3b8 3px 5px)",
              }}
              aria-hidden
            />
          </div>
          <p className="text-2xl text-slate-700 mt-1">days!</p>
        </div>
      </div>
    </div>
  );
}
