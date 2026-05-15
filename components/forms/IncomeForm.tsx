"use client";

import { useState } from "react";
import { useAllocateIncome, useDirectDeposit } from "@/hooks/useBudgets";
import { useConfig } from "@/hooks/useConfig";

function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, ""));
}

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
      <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Add Income</h2>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button type="button" onClick={() => { setMode("allocate"); setBreakdown(null); }} className={`flex-1 text-xs font-medium py-1 rounded-md transition-colors ${mode === "allocate" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>Allocate</button>
        <button type="button" onClick={() => { setMode("direct"); setBreakdown(null); }} className={`flex-1 text-xs font-medium py-1 rounded-md transition-colors ${mode === "direct" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>Direct</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "direct" && (
          <select value={directCategory} onChange={(e) => setDirectCategory(e.target.value)} className="border rounded px-3 py-2 text-sm w-full" required>
            <option value="">Select category</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        )}
        <input type="text" inputMode="numeric" placeholder="Income Amount" value={displayValue} onChange={(e) => setDisplayValue(formatWithSeparator(e.target.value))} className="border rounded px-3 py-2 text-sm w-full" required />
        <button type="submit" disabled={isPending} className="bg-green-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          {isPending ? (mode === "allocate" ? "Allocating..." : "Depositing...") : (mode === "allocate" ? "Allocate Income" : "Direct Deposit")}
        </button>
      </form>
      {breakdown && (
        <div className="mt-2 border rounded p-3 bg-green-50 text-sm">
          <p className="font-semibold text-green-800 mb-2">{mode === "allocate" ? "Allocation Breakdown" : "Deposited"}</p>
          {Object.entries(breakdown).filter(([, amt]) => amt > 0).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between">
              <span className="font-medium">{cat}</span>
              <span>+${amt.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
