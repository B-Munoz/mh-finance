"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncomes, deleteIncome } from "@/api/incomes";

export function useIncomes() {
  return useQuery({ queryKey: ["incomes"], queryFn: getIncomes });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteIncome(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
