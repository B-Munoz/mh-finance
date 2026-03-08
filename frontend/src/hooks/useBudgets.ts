import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, allocateIncome } from "../api/budgets";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });
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
