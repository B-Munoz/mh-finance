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
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import type { Expense } from "@/types";
import { useConfig } from "@/hooks/useConfig";
import { useBulkUpdateExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
  const [amountDrafts, setAmountDrafts] = useState<Record<number, string>>({});
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
    setAmountDrafts({});
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

  const columns = useMemo(() => [
    col.accessor("date", {
      header: "Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("es-CO"),
    }),
    col.accessor("category", {
      header: "Category",
      cell: (info) => (
        <select value={info.getValue()} onChange={(e) => { updateCell(info.row.index, "category", e.target.value); setShowModal(true); }} className="border-0 bg-transparent text-sm w-full rounded px-1 -mx-1 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white/5 text-gray-100 transition-colors">
          {(configRef.current?.categories ?? []).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      ),
    }),
    col.accessor("description", {
      header: "Description",
      cell: (info) => (
        <input value={info.getValue()} onChange={(e) => updateCell(info.row.index, "description", e.target.value)} onBlur={() => { if (isDirtyRef.current) setShowModal(true); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} className="border-0 bg-transparent text-sm w-full rounded px-1 -mx-1 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white/5 text-gray-100 transition-colors" />
      ),
    }),
    col.accessor("amount", {
      header: "Amount ($)",
      cell: (info) => (
        <input
          type="text"
          inputMode="decimal"
          value={amountDrafts[info.row.original.id] ?? String(info.getValue())}
          onChange={(e) => {
            const value = e.target.value;
            setAmountDrafts((prev) => ({ ...prev, [info.row.original.id]: value }));
            const parsed = Number(value);
            if (value.trim() && Number.isFinite(parsed) && parsed >= 0) updateCell(info.row.index, "amount", parsed);
          }}
          onBlur={() => {
            setAmountDrafts((prev) => {
              const next = { ...prev };
              delete next[info.row.original.id];
              return next;
            });
            if (isDirtyRef.current) setShowModal(true);
          }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="border-0 bg-transparent text-sm w-full text-right rounded px-1 -mx-1 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white/5 text-gray-100 transition-colors"
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
            <button onClick={() => { deleteExpenseRef.current.mutate(expense.id); setConfirmingId(null); }} disabled={deleteExpenseRef.current.isPending} className="text-red-400 text-xs font-medium hover:text-red-300 disabled:opacity-50">Confirm</button>
            <button onClick={() => setConfirmingId(null)} className="text-sidebar-muted text-xs hover:text-gray-200">Cancel</button>
          </span>
        ) : (
          <button
            onClick={() => { setConfirmingId(expense.id); setTimeout(() => { setConfirmingId((cur) => (cur === expense.id ? null : cur)); }, 5000); }}
            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete"
          ><Trash2 size={14} /></button>
        );
      },
    }),
  ], [amountDrafts, updateCell]);

  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const allRows = table.getRowModel().rows;
  const visibleRows = showAll ? allRows : allRows.slice(0, PAGE_SIZE);

  function handleDiscard() {
    setData(expensesRef.current);
    setAmountDrafts({});
    isDirtyRef.current = false;
    setShowModal(false);
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-surface-border rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-100">Unsaved changes</p>
              <p className="text-xs text-sidebar-muted mt-1">Do you want to save or discard your edits?</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => bulkUpdate.mutate(data, { onSuccess: () => { isDirtyRef.current = false; setAmountDrafts({}); setShowModal(false); } })} disabled={bulkUpdate.isPending} variant="primary" className="flex-1">
                {bulkUpdate.isPending ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleDiscard} disabled={bulkUpdate.isPending} variant="secondary" className="flex-1">Discard</Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center px-4 py-3 border-b border-surface-border">
        <p className="text-sm font-semibold text-gray-100">Transactions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-surface-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left text-xs font-semibold text-sidebar-muted uppercase tracking-wide cursor-pointer select-none hover:text-gray-200 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <ArrowUp size={12} />, desc: <ArrowDown size={12} /> }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b border-surface-border last:border-0 hover:bg-white/5 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center text-sidebar-muted text-sm py-8">No transactions yet</p>}
        {allRows.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-surface-border text-center">
            <button onClick={() => setShowAll((v) => !v)} className="text-xs text-accent-600 hover:text-accent-700 font-medium">
              {showAll ? "Show less" : `Show all ${allRows.length} transactions`}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
