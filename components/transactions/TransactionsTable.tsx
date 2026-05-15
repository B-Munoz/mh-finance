"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { Expense } from "@/types";
import { useConfig } from "@/hooks/useConfig";
import { useBulkUpdateExpenses, useDeleteExpense } from "@/hooks/useExpenses";

interface Props {
  expenses: Expense[];
}

const col = createColumnHelper<Expense>();
const PAGE_SIZE = 5;

export function TransactionsTable({ expenses }: Props) {
  const { data: config } = useConfig();
  const bulkUpdate = useBulkUpdateExpenses();
  const deleteExpense = useDeleteExpense();
  const [data, setData] = useState<Expense[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const isDirtyRef = useRef(false);
  const configRef = useRef(config);
  const deleteExpenseRef = useRef(deleteExpense);
  const confirmingIdRef = useRef<number | null>(null);
  const expensesRef = useRef(expenses);

  configRef.current = config;
  deleteExpenseRef.current = deleteExpense;
  confirmingIdRef.current = confirmingId;
  expensesRef.current = expenses;

  useEffect(() => {
    setData(expenses);
    isDirtyRef.current = false;
    setShowModal(false);
  }, [expenses]);

  const updateCell = useCallback((rowIndex: number, field: keyof Expense, value: string | number) => {
    setData((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [field]: value };
      return next;
    });
    isDirtyRef.current = true;
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => [
    col.accessor("date", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("es-CO"),
    }),
    col.accessor("category", {
      header: "Category",
      cell: (info) => (
        <select value={info.getValue()} onChange={(e) => { updateCell(info.row.index, "category", e.target.value); setShowModal(true); }} className="border-0 bg-transparent text-sm w-full">
          {(configRef.current?.categories ?? []).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      ),
    }),
    col.accessor("description", {
      header: "Description",
      cell: (info) => (
        <input value={info.getValue()} onChange={(e) => updateCell(info.row.index, "description", e.target.value)} onBlur={() => { if (isDirtyRef.current) setShowModal(true); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} className="border-0 bg-transparent text-sm w-full" />
      ),
    }),
    col.accessor("amount", {
      header: "Amount ($)",
      cell: (info) => (
        <input
          type="text"
          inputMode="numeric"
          value={info.getValue().toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          onChange={(e) => { const parsed = parseFloat(e.target.value.replace(/\./g, "")); if (!isNaN(parsed)) updateCell(info.row.index, "amount", parsed); }}
          onBlur={() => { if (isDirtyRef.current) setShowModal(true); }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="border-0 bg-transparent text-sm w-full text-right"
        />
      ),
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const expense = info.row.original;
        const isConfirming = confirmingIdRef.current === expense.id;
        return isConfirming ? (
          <span className="flex items-center gap-1">
            <button onClick={() => { deleteExpenseRef.current.mutate(expense.id); setConfirmingId(null); }} disabled={deleteExpenseRef.current.isPending} className="text-red-600 text-xs font-medium hover:text-red-800 disabled:opacity-50">Confirm</button>
            <button onClick={() => setConfirmingId(null)} className="text-gray-500 text-xs hover:text-gray-700">Cancel</button>
          </span>
        ) : (
          <button
            onClick={() => { setConfirmingId(expense.id); setTimeout(() => { setConfirmingId((cur) => (cur === expense.id ? null : cur)); }, 5000); }}
            className="text-red-500 hover:text-red-700 text-xs px-2"
            title="Delete"
          >✕</button>
        );
      },
    }),
  ], []);

  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const allRows = table.getRowModel().rows;
  const visibleRows = showAll ? allRows : allRows.slice(0, PAGE_SIZE);

  function handleDiscard() {
    setData(expensesRef.current);
    isDirtyRef.current = false;
    setShowModal(false);
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Unsaved changes</p>
              <p className="text-xs text-gray-500 mt-1">Do you want to save or discard your edits?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => bulkUpdate.mutate(data, { onSuccess: () => { isDirtyRef.current = false; setShowModal(false); } })} disabled={bulkUpdate.isPending} className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {bulkUpdate.isPending ? "Saving..." : "Save"}
              </button>
              <button onClick={handleDiscard} disabled={bulkUpdate.isPending} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Discard</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center px-4 py-3 border-b">
        <p className="text-sm font-semibold text-gray-700">Transactions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
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
                  <td key={cell.id} className="px-4 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No transactions yet</p>}
        {allRows.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t text-center">
            <button onClick={() => setShowAll((v) => !v)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              {showAll ? "Show less" : `Show all ${allRows.length} transactions`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
