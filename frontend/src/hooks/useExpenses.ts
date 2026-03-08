import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, bulkUpdateExpenses, deleteExpense } from "../api/expenses";
import type { Expense } from "../types";

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useBulkUpdateExpenses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenses: Expense[]) => bulkUpdateExpenses(expenses),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
