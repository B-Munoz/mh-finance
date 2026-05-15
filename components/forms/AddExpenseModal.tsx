"use client";

import { useState } from "react";
import { useCreateExpense } from "@/hooks/useExpenses";

function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, ""));
}

interface Props {
  category: string;
  onClose: () => void;
}

export function AddExpenseModal({ category, onClose }: Props) {
  const createExpense = useCreateExpense();
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayAmount) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    createExpense.mutate({ category, description, amount }, { onSuccess: () => onClose() });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">✕</button>
        </div>
        <p className="text-sm font-medium text-gray-700">{category}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Amount"
            value={displayAmount}
            onChange={(e) => setDisplayAmount(formatWithSeparator(e.target.value))}
            className="border rounded px-3 py-2 text-sm w-full"
            autoFocus
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <button type="submit" disabled={createExpense.isPending} className="bg-blue-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
