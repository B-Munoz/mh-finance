import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { Expense } from "../../types";
import { useConfig } from "../../hooks/useConfig";
import { useBulkUpdateExpenses, useDeleteExpense } from "../../hooks/useExpenses";

interface Props {
  expenses: Expense[];
}

const col = createColumnHelper<Expense>();

const PAGE_SIZE = 10;

export function TransactionsTable({ expenses }: Props) {
  const { data: config } = useConfig();
  const bulkUpdate = useBulkUpdateExpenses();
  const deleteExpense = useDeleteExpense();
  const [data, setData] = useState<Expense[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [isDirty, setIsDirty] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setData(expenses);
    setIsDirty(false);
  }, [expenses]);

  function updateCell(rowIndex: number, field: keyof Expense, value: string | number) {
    setData((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [field]: value };
      return next;
    });
    setIsDirty(true);
  }

  function handleDelete(expense: Expense) {
    deleteExpense.mutate(expense.id);
  }

  const columns = [
    col.accessor("date", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("es-CO"),
    }),
    col.accessor("category", {
      header: "Category",
      cell: (info) => (
        <select
          value={info.getValue()}
          onChange={(e) => updateCell(info.row.index, "category", e.target.value)}
          className="border-0 bg-transparent text-sm w-full"
        >
          {(config?.categories ?? []).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      ),
    }),
    col.accessor("description", {
      header: "Description",
      cell: (info) => (
        <input
          value={info.getValue()}
          onChange={(e) => updateCell(info.row.index, "description", e.target.value)}
          className="border-0 bg-transparent text-sm w-full"
        />
      ),
    }),
    col.accessor("amount", {
      header: "Amount ($)",
      cell: (info) => (
        <input
          type="number"
          value={info.getValue()}
          onChange={(e) => updateCell(info.row.index, "amount", parseFloat(e.target.value))}
          className="border-0 bg-transparent text-sm w-full text-right"
        />
      ),
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <button
          onClick={() => handleDelete(info.row.original)}
          className="text-red-500 hover:text-red-700 text-xs px-2"
          title="Delete"
        >
          ✕
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const allRows = table.getRowModel().rows;
  const visibleRows = showAll ? allRows : allRows.slice(0, PAGE_SIZE);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <p className="text-sm font-semibold text-gray-700">Transactions</p>
        {isDirty && (
          <button
            onClick={() => bulkUpdate.mutate(data, { onSuccess: () => setIsDirty(false) })}
            disabled={bulkUpdate.isPending}
            className="bg-blue-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {bulkUpdate.isPending ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No transactions yet</p>
        )}
        {allRows.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAll ? "Show less" : `Show all ${allRows.length} transactions`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
