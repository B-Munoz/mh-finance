import { getDb } from "../db";

export async function loadExpenses(userKey: string) {
  const sql = getDb(userKey);
  const rows = await sql`SELECT id, date, category, description, amount FROM expenses ORDER BY date DESC`;
  return rows.map((r) => ({
    id: r.id as number,
    date: r.date as string,
    category: r.category as string,
    description: r.description as string,
    amount: r.amount as number,
  }));
}

export async function addExpense(userKey: string, category: string, description: string, amount: number) {
  const sql = getDb(userKey);
  const [rows] = await sql.transaction([
    sql`INSERT INTO expenses (date, category, description, amount) VALUES (NOW(), ${category}, ${description}, ${amount}) RETURNING id, date`,
    sql`UPDATE budgets SET current_balance = current_balance - ${amount} WHERE category = ${category}`,
  ]);
  const row = rows[0] as { id: number; date: string };
  return { id: row.id, date: row.date, category, description, amount };
}

export async function deleteExpense(userKey: string, id: number): Promise<boolean> {
  const sql = getDb(userKey);
  const rows = await sql`SELECT category, amount FROM expenses WHERE id = ${id}`;
  if (!rows.length) return false;

  const { category, amount } = rows[0] as { category: string; amount: number };
  await sql.transaction([
    sql`DELETE FROM expenses WHERE id = ${id}`,
    sql`UPDATE budgets SET current_balance = current_balance + ${amount} WHERE category = ${category}`,
  ]);
  return true;
}

export async function saveBulkData(
  userKey: string,
  expenses: { id?: number; date: string; category: string; description: string; amount: number }[],
) {
  const sql = getDb(userKey);

  const oldRows = await sql`SELECT category, amount FROM expenses`;
  const oldTotals: Record<string, number> = {};
  for (const r of oldRows) {
    const cat = r.category as string;
    oldTotals[cat] = (oldTotals[cat] ?? 0) + (r.amount as number);
  }

  const newTotals: Record<string, number> = {};
  for (const e of expenses) newTotals[e.category] = (newTotals[e.category] ?? 0) + e.amount;

  const allCats = new Set([...Object.keys(oldTotals), ...Object.keys(newTotals)]);
  const diffs: Record<string, number> = {};
  for (const cat of allCats) diffs[cat] = (newTotals[cat] ?? 0) - (oldTotals[cat] ?? 0);

  const inserts = expenses.map(
    (e) =>
      sql`INSERT INTO expenses (id, date, category, description, amount) VALUES (${e.id ?? null}, ${e.date}, ${e.category}, ${e.description}, ${e.amount})`,
  );
  const budgetUpdates = Object.entries(diffs)
    .filter(([, d]) => d !== 0)
    .map(([cat, diff]) => sql`UPDATE budgets SET current_balance = current_balance - ${diff} WHERE category = ${cat}`);

  await sql.transaction([sql`DELETE FROM expenses`, ...inserts, ...budgetUpdates]);
}
