import { useState } from "react";
import { useIncomes, useDeleteIncome } from "../../hooks/useIncomes";
import type { IncomeRecord } from "../../types";

function formatCurrency(n: number) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function IncomeRow({ record }: { record: IncomeRecord }) {
  const [expanded, setExpanded] = useState(false);
  const deleteIncome = useDeleteIncome();

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-gray-50">
        <td className="px-4 py-2 text-sm text-gray-600">
          {new Date(record.date).toLocaleDateString("es-CO")}
        </td>
        <td className="px-4 py-2 text-sm font-medium text-gray-800">
          {formatCurrency(record.amount)}
        </td>
        <td className="px-4 py-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {expanded ? "Hide" : "Show"} breakdown
          </button>
        </td>
        <td className="px-4 py-2">
          <button
            onClick={() => deleteIncome.mutate(record.id)}
            disabled={deleteIncome.isPending}
            className="text-red-500 hover:text-red-700 text-xs px-2 disabled:opacity-50"
            title="Delete and reverse allocations"
          >
            ✕
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={4} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
              {Object.entries(record.allocations)
                .filter(([, amt]) => amt > 0)
                .map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-xs text-gray-600">
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

export function IncomeHistory() {
  const { data: incomes = [], isLoading } = useIncomes();

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b">
        <p className="text-sm font-semibold text-gray-700">Income History</p>
      </div>
      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Breakdown</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {incomes.map((record) => (
                <IncomeRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
          {incomes.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No income records yet</p>
          )}
        </div>
      )}
    </div>
  );
}
