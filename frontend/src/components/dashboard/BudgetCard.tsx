import type { Budget } from "../../types";

interface Props {
  budget: Budget;
}

export function BudgetCard({ budget }: Props) {
  const { category, current_balance, limit } = budget;
  const hasLimit = limit > 0;
  const progress = hasLimit ? Math.min(Math.max(current_balance / limit, 0), 1) : null;

  const pct = progress !== null ? Math.round(progress * 100) : null;
  const barColor =
    pct === null ? "bg-blue-400" : pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500";

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm">{category}</p>
        {hasLimit && (
          <span className="text-xs text-gray-400">
            / ${limit.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
      <p className="text-xl font-bold">
        ${current_balance.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
      </p>
      {hasLimit && progress !== null && (
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
