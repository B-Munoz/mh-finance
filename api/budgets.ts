import client from "./client";
import type { Budget, UserConfig, AllocationResult, RelocateResult, DirectDepositResult } from "@/types";

export const getBudgets = (): Promise<Budget[]> => client.get("/budgets").then((r) => r.data);

export const getConfig = (): Promise<UserConfig> => client.get("/config").then((r) => r.data);

export const allocateIncome = (income_amount: number): Promise<AllocationResult> =>
  client.post("/budgets/allocate", { income_amount }).then((r) => r.data);

export const relocateBudget = (params: {
  from_category: string;
  to_category: string;
  amount: number;
}): Promise<RelocateResult> => client.post("/budgets/relocate", params).then((r) => r.data);

export const directDeposit = (params: { category: string; amount: number }): Promise<DirectDepositResult> =>
  client.post("/budgets/direct", params).then((r) => r.data);
