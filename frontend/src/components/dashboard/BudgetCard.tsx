import { useState } from "react";
import type { Budget } from "../../types";
import { AddExpenseModal } from "../forms/AddExpenseModal";

interface Props {
  budget: Budget;
}

export function BudgetCard({ budget }: Props) {
  const { category, current_balance, limit } = budget;
  const hasLimit = limit > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const progress = hasLimit ? Math.min(Math.max(current_balance / limit, 0), 1) : null;

  const pct = progress !== null ? Math.round(progress * 100) : null;

  // Discrete gradient: full (green) → empty (red)
  function getBarColor(p: number): string {
    if (p >= 75) return "#16a34a"; // green-600
    if (p >= 50) return "#ca8a04"; // yellow-600
    if (p >= 25) return "#ea580c"; // orange-600
    return "#dc2626"; // red-600
  }

  const barStyle: React.CSSProperties =
    pct !== null
      ? { width: `${pct}%`, backgroundColor: getBarColor(pct) }
      : { width: "100%", backgroundColor: "#60a5fa" };

  return (
    <>
    <div className="bg-white rounded-lg border p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm">{category}</p>
        <div className="flex items-center gap-2">
          {hasLimit && (
            <span className="text-xs text-gray-400">
              / ${limit.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-blue-600 text-4xl font-bold leading-none"
            aria-label={`Add expense to ${category}`}
          >
            +
          </button>
        </div>
      </div>
      <p className="text-xl font-bold">
        ${current_balance.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
      </p>
      {hasLimit && progress !== null && (
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={barStyle}
          />
        </div>
      )}
    </div>
    {isModalOpen && (
      <AddExpenseModal category={category} onClose={() => setIsModalOpen(false)} />
    )}
    </>
  );
}
