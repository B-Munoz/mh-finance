import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Expense } from "../../types";

interface Props {
  expenses: Expense[];
}

export function ExpensesChart({ expenses }: Props) {
  if (!expenses.length) return null;

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  const data = Object.entries(byCategory).map(([category, amount]) => ({
    category,
    amount: Math.round(amount),
  }));

  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm font-semibold mb-3 text-gray-700">Expenses by Category</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CO")}`} />
          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
