import client from "./client";
import type { Budget, UserConfig, AllocationResult, RelocateResult, DirectDepositResult } from "../types";

export const getBudgets = async (): Promise<Budget[]> => {
  const { data } = await client.get<Budget[]>("/budgets");
  return data;
};

export const getConfig = async (): Promise<UserConfig> => {
  const { data } = await client.get<UserConfig>("/config");
  return data;
};

export const allocateIncome = async (income_amount: number): Promise<AllocationResult> => {
  const { data } = await client.post<AllocationResult>("/budgets/allocate", { income_amount });
  return data;
};

export const relocateBudget = async (params: {
  from_category: string;
  to_category: string;
  amount: number;
}): Promise<RelocateResult> => {
  const { data } = await client.post<RelocateResult>("/budgets/relocate", params);
  return data;
};

export const directDeposit = async (params: {
  category: string;
  amount: number;
}): Promise<DirectDepositResult> => {
  const { data } = await client.post<DirectDepositResult>("/budgets/direct", params);
  return data;
};
