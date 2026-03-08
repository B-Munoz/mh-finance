import { useState } from "react";
import { useAllocateIncome } from "../../hooks/useBudgets";

function formatWithSeparator(raw: string): string {
  // Keep only digits
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Add . as thousands separator (es-CO style)
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseAmount(formatted: string): number {
  // Remove thousands separators (.) and parse
  return parseFloat(formatted.replace(/\./g, ""));
}

export function IncomeForm() {
  const allocate = useAllocateIncome();
  const [displayValue, setDisplayValue] = useState("");
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayValue(formatWithSeparator(e.target.value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayValue) return;
    const amount = parseAmount(displayValue);
    if (!amount) return;
    allocate.mutate(amount, {
      onSuccess: (data) => {
        setBreakdown(data.allocations);
        setDisplayValue("");
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Add Income</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Income Amount"
          value={displayValue}
          onChange={handleChange}
          className="border rounded px-3 py-2 text-sm w-full"
          required
        />
        <button
          type="submit"
          disabled={allocate.isPending}
          className="bg-green-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {allocate.isPending ? "Allocating..." : "Allocate Income"}
        </button>
      </form>

      {breakdown && (
        <div className="mt-2 border rounded p-3 bg-green-50 text-sm">
          <p className="font-semibold text-green-800 mb-2">Allocation Breakdown</p>
          {Object.entries(breakdown)
            .filter(([, amt]) => amt > 0)
            .map(([cat, amt]) => (
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
