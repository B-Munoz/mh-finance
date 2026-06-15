"use client";

import { useState } from "react";
import { useAllocateIncome, useDirectDeposit } from "@/hooks/useBudgets";
import { useConfig } from "@/hooks/useConfig";
import { formatWithSeparator, parseAmount } from "@/lib/format";
import { cn } from "@/lib/cn";

const darkFieldClass = "bg-sidebar-hover border border-sidebar-border text-white placeholder:text-sidebar-muted rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent-500 transition-colors";

export function IncomeForm() {
  const allocate = useAllocateIncome();
  const deposit = useDirectDeposit();
  const { data: config } = useConfig();
  const [mode, setMode] = useState<"allocate" | "direct">("allocate");
  const [displayValue, setDisplayValue] = useState("");
  const [directCategory, setDirectCategory] = useState("");
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);

  const categories = config?.categories ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayValue) return;
    const amount = parseAmount(displayValue);
    if (!amount) return;

    if (mode === "allocate") {
      allocate.mutate(amount, {
        onSuccess: (data) => { setBreakdown(data.allocations); setDisplayValue(""); },
      });
    } else {
      if (!directCategory) return;
      deposit.mutate({ category: directCategory, amount }, {
        onSuccess: (data) => { setBreakdown({ [data.category]: data.amount }); setDisplayValue(""); setDirectCategory(""); },
      });
    }
  }

  const isPending = mode === "allocate" ? allocate.isPending : deposit.isPending;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm text-sidebar-muted uppercase tracking-wide">Add Income</h2>
      <div className="flex gap-1 bg-sidebar-hover rounded-lg p-1">
        <button type="button" onClick={() => { setMode("allocate"); setBreakdown(null); }} className={cn("flex-1 text-xs font-medium py-1 rounded-md transition-colors", mode === "allocate" ? "bg-accent-600 text-white" : "text-sidebar-muted hover:text-white")}>Allocate</button>
        <button type="button" onClick={() => { setMode("direct"); setBreakdown(null); }} className={cn("flex-1 text-xs font-medium py-1 rounded-md transition-colors", mode === "direct" ? "bg-accent-600 text-white" : "text-sidebar-muted hover:text-white")}>Direct</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "direct" && (
          <select value={directCategory} onChange={(e) => setDirectCategory(e.target.value)} className={darkFieldClass} required>
            <option value="">Select category</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        )}
        <input type="text" inputMode="numeric" placeholder="Income Amount" value={displayValue} onChange={(e) => setDisplayValue(formatWithSeparator(e.target.value))} className={darkFieldClass} required />
        <button type="submit" disabled={isPending} className="bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
          {isPending ? (mode === "allocate" ? "Allocating..." : "Depositing...") : (mode === "allocate" ? "Allocate Income" : "Direct Deposit")}
        </button>
      </form>
      {breakdown && (
        <div className="mt-2 border border-green-500/20 rounded-lg p-3 bg-green-500/10 text-sm">
          <p className="font-semibold text-green-400 mb-2">{mode === "allocate" ? "Allocation Breakdown" : "Deposited"}</p>
          {Object.entries(breakdown).filter(([, amt]) => amt > 0).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between text-gray-200">
              <span className="font-medium">{cat}</span>
              <span className="text-green-300">+${amt.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
