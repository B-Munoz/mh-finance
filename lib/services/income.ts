import { getDb } from "../db";

export async function saveIncomeRecord(userKey: string, amount: number, allocations: Record<string, number>) {
  const sql = getDb(userKey);
  const [rows] = await sql.transaction([
    sql`INSERT INTO incomes (amount, allocations) VALUES (${amount}, ${JSON.stringify(allocations)}) RETURNING id, date`,
  ]);
  return rows[0] as { id: number; date: string };
}

export async function listIncomes(userKey: string) {
  const sql = getDb(userKey);
  const rows = await sql`SELECT id, date, amount, allocations FROM incomes ORDER BY date DESC`;
  return rows.map((r) => ({
    id: r.id as number,
    date: r.date as string,
    amount: r.amount as number,
    allocations: JSON.parse(r.allocations as string) as Record<string, number>,
  }));
}

export async function deleteIncome(userKey: string, id: number): Promise<boolean> {
  const sql = getDb(userKey);
  const rows = await sql`SELECT allocations FROM incomes WHERE id = ${id}`;
  if (!rows.length) return false;

  const allocations = JSON.parse(rows[0].allocations as string) as Record<string, number>;
  const updates = Object.entries(allocations).map(
    ([cat, amt]) => sql`UPDATE budgets SET current_balance = current_balance - ${amt} WHERE category = ${cat}`,
  );
  await sql.transaction([sql`DELETE FROM incomes WHERE id = ${id}`, ...updates]);
  return true;
}
