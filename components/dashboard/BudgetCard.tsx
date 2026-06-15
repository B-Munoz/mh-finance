"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Budget } from "@/types";
import { AddExpenseModal } from "@/components/forms/AddExpenseModal";
import { Card } from "@/components/ui/Card";

interface Props {
  budget: Budget;
}

function fmtAmount(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + "K";
  return "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function getBarColor(p: number): string {
  if (p >= 75) return "#16a34a";
  if (p >= 50) return "#ca8a04";
  if (p >= 25) return "#ea580c";
  return "#dc2626";
}

export function BudgetCard({ budget }: Props) {
  const { category, current_balance, limit } = budget;
  const hasLimit = limit > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const progress = hasLimit ? Math.min(Math.max(current_balance / limit, 0), 1) : null;
  const pct = progress !== null ? Math.round(progress * 100) : null;

  const barStyle: React.CSSProperties =
    pct !== null
      ? { width: `${pct}%`, backgroundColor: getBarColor(pct) }
      : { width: "100%", backgroundColor: "#60a5fa" };

  return (
    <>
      <Card padding="sm" className="relative flex flex-col gap-2 hover:shadow-md transition-shadow">
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-3 right-3 text-sidebar-muted hover:text-accent-500 hover:bg-accent-500/10 rounded-lg p-1 transition-colors"
          aria-label={`Add expense to ${category}`}
        >
          <Plus size={18} />
        </button>
        <div className="flex justify-between items-start pr-6">
          <p className="font-medium text-sm text-gray-100">{category}</p>
          {hasLimit && <span className="text-xs text-sidebar-muted">/ {fmtAmount(limit)}</span>}
        </div>
        <p className="text-xl font-bold text-white">${current_balance.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>
        {hasLimit && progress !== null && (
          <div className="w-full bg-surface-hover rounded-full h-2">
            <div className="h-2 rounded-full transition-all" style={barStyle} />
          </div>
        )}
      </Card>
      {isModalOpen && <AddExpenseModal category={category} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
