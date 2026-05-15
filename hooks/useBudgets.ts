"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, allocateIncome, relocateBudget, directDeposit } from "@/api/budgets";

export function useBudgets() {
  return useQuery({ queryKey: ["budgets"], queryFn: getBudgets });
}

export function useAllocateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (income_amount: number) => allocateIncome(income_amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}

export function useRelocateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: relocateBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDirectDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: directDeposit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}
