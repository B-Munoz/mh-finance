import client from "./client";
import type { Expense } from "@/types";

export const getExpenses = (): Promise<Expense[]> => client.get("/expenses").then((r) => r.data);

export const createExpense = (body: { category: string; description: string; amount: number }): Promise<Expense> =>
  client.post("/expenses", body).then((r) => r.data);

export const bulkUpdateExpenses = (expenses: Expense[]): Promise<void> =>
  client.put("/expenses/bulk", { expenses }).then((r) => r.data);

export const deleteExpense = (id: number): Promise<void> => client.delete(`/expenses/${id}`).then((r) => r.data);
