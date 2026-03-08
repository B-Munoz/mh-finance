import { useState } from "react";
import { useConfig } from "../../hooks/useConfig";
import { useCreateExpense } from "../../hooks/useExpenses";

function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, ""));
}

export function AddExpenseForm() {
  const { data: config } = useConfig();
  const createExpense = useCreateExpense();
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const categories = config?.categories ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayAmount || !category) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    createExpense.mutate(
      { category, description, amount },
      {
        onSuccess: () => {
          setDisplayAmount("");
          setDescription("");
          setCategory("");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Add Expense</h2>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Amount"
        value={displayAmount}
        onChange={(e) => setDisplayAmount(formatWithSeparator(e.target.value))}
        className="border rounded px-3 py-2 text-sm w-full"
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full"
        required
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={createExpense.isPending}
        className="bg-blue-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {createExpense.isPending ? "Adding..." : "Add Expense"}
      </button>
      {createExpense.isSuccess && (
        <p className="text-green-600 text-xs">Expense added!</p>
      )}
    </form>
  );
}
