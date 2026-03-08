import client from "./client";
import type { Budget, UserConfig, AllocationResult } from "../types";

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
