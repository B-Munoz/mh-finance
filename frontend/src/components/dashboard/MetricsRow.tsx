import type { Expense } from "../../types";

interface Props {
  expenses: Expense[];
}

export function MetricsRow({ expenses }: Props) {
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const count = thisMonth.length;

  const monthLabel = now.toLocaleString("es-CO", { month: "long" });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Spent in {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </p>
        <p className="text-2xl font-bold mt-1">
          ${monthTotal.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Transactions</p>
        <p className="text-2xl font-bold mt-1">{count}</p>
      </div>
    </div>
  );
}
