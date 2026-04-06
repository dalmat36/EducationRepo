"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ExpenseSummary, CATEGORIES, CATEGORY_COLORS } from "@/types/expense";
import { formatCurrency } from "@/utils/formatters";

interface CategoryChartProps {
  summary: ExpenseSummary;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-sm font-medium text-slate-700">{payload[0].name}</p>
        <p className="text-base font-bold" style={{ color: payload[0].payload.fill }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function CategoryChart({ summary }: CategoryChartProps) {
  const data = CATEGORIES.filter((cat) => summary.byCategory[cat] > 0).map((cat) => ({
    name: cat,
    value: summary.byCategory[cat],
    fill: CATEGORY_COLORS[cat],
  }));

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">No spending data yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
