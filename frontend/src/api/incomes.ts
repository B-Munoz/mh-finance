import client from "./client";
import type { IncomeRecord } from "../types";

export const getIncomes = (): Promise<IncomeRecord[]> =>
  client.get("/incomes").then((r) => r.data);

export const deleteIncome = (id: number): Promise<void> =>
  client.delete(`/incomes/${id}`).then((r) => r.data);
