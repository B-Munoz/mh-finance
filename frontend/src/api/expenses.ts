import client from "./client";
import type { Expense } from "../types";

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await client.get<Expense[]>("/expenses");
  return data;
};

export const createExpense = async (body: {
  category: string;
  description: string;
  amount: number;
}): Promise<Expense> => {
  const { data } = await client.post<Expense>("/expenses", body);
  return data;
};

export const bulkUpdateExpenses = async (expenses: Expense[]): Promise<void> => {
  await client.put("/expenses/bulk", { expenses });
};

export const deleteExpense = async (id: number): Promise<void> => {
  await client.delete(`/expenses/${id}`);
};
