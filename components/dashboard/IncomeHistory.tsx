"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { useIncomes, useDeleteIncome } from "@/hooks/useIncomes";
import type { IncomeRecord } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

function IncomeRow({ record }: { record: IncomeRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const deleteIncome = useDeleteIncome();

  function handleDeleteClick() {
    if (confirming) {
      deleteIncome.mutate(record.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
    }
  }

  return (
    <>
      <tr className="border-b border-surface-border last:border-0 hover:bg-white/5 transition-colors">
        <td className="px-4 py-2 text-sm text-sidebar-muted">{new Date(record.date).toLocaleDateString("es-CO")}</td>
        <td className="px-4 py-2 text-sm font-medium text-gray-100">{formatCurrency(record.amount)}</td>
        <td className="px-4 py-2">
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1">
            {expanded ? "Hide" : "Show"} breakdown
            <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </td>
        <td className="px-4 py-2">
          {confirming ? (
            <span className="flex items-center gap-1">
              <button onClick={handleDeleteClick} disabled={deleteIncome.isPending} className="text-red-400 text-xs font-medium hover:text-red-300 disabled:opacity-50">Confirm</button>
              <button onClick={() => setConfirming(false)} className="text-sidebar-muted text-xs hover:text-gray-200">Cancel</button>
            </span>
          ) : (
            <button onClick={handleDeleteClick} disabled={deleteIncome.isPending} className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Delete and reverse allocations">
              <Trash2 size={14} />
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-white/5">
          <td colSpan={4} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
              {Object.entries(record.allocations).filter(([, amt]) => amt > 0).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between text-xs text-gray-300">
                  <span>{cat}</span>
                  <span className="font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const PAGE_SIZE = 5;

export function IncomeHistory() {
  const { data: incomes = [], isLoading } = useIncomes();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? incomes : incomes.slice(0, PAGE_SIZE);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-border">
        <p className="text-sm font-semibold text-gray-100">Income History</p>
      </div>
      {isLoading ? (
        <p className="text-center text-sidebar-muted text-sm py-8">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-surface-border">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-sidebar-muted uppercase tracking-wide">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-sidebar-muted uppercase tracking-wide">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-sidebar-muted uppercase tracking-wide">Breakdown</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>{visible.map((record) => <IncomeRow key={record.id} record={record} />)}</tbody>
          </table>
          {incomes.length === 0 && <p className="text-center text-sidebar-muted text-sm py-8">No income records yet</p>}
          {incomes.length > PAGE_SIZE && (
            <div className="px-4 py-3 border-t border-surface-border text-center">
              <button onClick={() => setShowAll((v) => !v)} className="text-xs text-accent-600 hover:text-accent-700 font-medium">
                {showAll ? "Show less" : `Show all ${incomes.length} entries`}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
