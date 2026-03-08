import type { Expense } from "../../types";

interface Props {
  expenses: Expense[];
}

export function MetricsRow({ expenses }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
        <p className="text-2xl font-bold mt-1">
          ${total.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
        </p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Transactions</p>
        <p className="text-2xl font-bold mt-1">{count}</p>
      </div>
    </div>
  );
}
