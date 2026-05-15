"use client";

import { useState } from "react";
import { useConfig } from "@/hooks/useConfig";
import { useRelocateBudget } from "@/hooks/useBudgets";

function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, ""));
}

export function RelocateForm() {
  const { data: config } = useConfig();
  const relocate = useRelocateBudget();
  const [fromCat, setFromCat] = useState("");
  const [toCat, setToCat] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");

  const categories = config?.categories ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromCat || !toCat || !displayAmount || fromCat === toCat) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    relocate.mutate(
      { from_category: fromCat, to_category: toCat, amount },
      { onSuccess: () => { setDisplayAmount(""); setFromCat(""); setToCat(""); } },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Relocate Budget</h2>
      <select value={fromCat} onChange={(e) => setFromCat(e.target.value)} className="border rounded px-3 py-2 text-sm w-full" required>
        <option value="">From category</option>
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <select value={toCat} onChange={(e) => setToCat(e.target.value)} className="border rounded px-3 py-2 text-sm w-full" required>
        <option value="">To category</option>
        {categories.filter((c) => c !== fromCat).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <input type="text" inputMode="numeric" placeholder="Amount" value={displayAmount} onChange={(e) => setDisplayAmount(formatWithSeparator(e.target.value))} className="border rounded px-3 py-2 text-sm w-full" required />
      <button type="submit" disabled={relocate.isPending} className="bg-purple-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
        {relocate.isPending ? "Moving..." : "Relocate"}
      </button>
      {relocate.isSuccess && <p className="text-green-600 text-xs">Relocated!</p>}
      {relocate.isError && <p className="text-red-600 text-xs">{(relocate.error as any)?.response?.data?.detail ?? "Error"}</p>}
    </form>
  );
}
