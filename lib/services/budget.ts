import { getDb } from "../db";
import { saveIncomeRecord } from "./income";

export async function getBalances(userKey: string): Promise<Record<string, number>> {
  const sql = getDb(userKey);
  const rows = await sql`SELECT category, current_balance FROM budgets`;
  const map: Record<string, number> = {};
  for (const r of rows) map[r.category as string] = r.current_balance as number;
  return map;
}

export async function allocateIncome(
  userKey: string,
  incomeAmount: number,
  allocationMap: Record<string, number>,
  limitMap: Record<string, number>,
): Promise<Record<string, number>> {
  const currentBalances = await getBalances(userKey);
  const allocations: Record<string, number> = Object.fromEntries(Object.keys(allocationMap).map((k) => [k, 0]));
  let remaining = Number(incomeAmount);

  while (remaining > 0.01) {
    const activeCats = Object.entries(allocationMap)
      .filter(([cat, pct]) => {
        if (pct <= 0) return false;
        const limit = limitMap[cat] ?? 0;
        const current = (currentBalances[cat] ?? 0) + allocations[cat];
        return limit === 0 || current < limit;
      })
      .map(([cat]) => cat);

    if (!activeCats.length) break;

    const totalWeight = activeCats.reduce((s, c) => s + allocationMap[c], 0);
    if (totalWeight === 0) break;

    let distributed = 0;
    for (const cat of activeCats) {
      const weight = allocationMap[cat] / totalWeight;
      const share = remaining * weight;
      const limit = limitMap[cat] ?? 0;
      const current = (currentBalances[cat] ?? 0) + allocations[cat];
      const space = limit > 0 ? limit - current : Infinity;
      const actual = Math.min(share, space);
      allocations[cat] += actual;
      distributed += actual;
    }

    remaining -= distributed;
    if (distributed < 0.01) break;
  }

  const sql = getDb(userKey);
  const updates = Object.entries(allocations)
    .filter(([, amt]) => amt > 0)
    .map(([cat, amt]) => sql`UPDATE budgets SET current_balance = current_balance + ${amt} WHERE category = ${cat}`);

  if (updates.length > 0) await sql.transaction(updates);

  await saveIncomeRecord(userKey, incomeAmount, allocations);

  return allocations;
}

export async function relocateBudget(userKey: string, fromCat: string, toCat: string, amount: number) {
  const balances = await getBalances(userKey);
  if (!(fromCat in balances)) throw Object.assign(new Error(`Category '${fromCat}' does not exist`), { status: 400 });
  if (!(toCat in balances)) throw Object.assign(new Error(`Category '${toCat}' does not exist`), { status: 400 });
  if (balances[fromCat] < amount) throw Object.assign(new Error(`Insufficient balance in '${fromCat}'`), { status: 400 });

  const sql = getDb(userKey);
  await sql.transaction([
    sql`UPDATE budgets SET current_balance = current_balance - ${amount} WHERE category = ${fromCat}`,
    sql`UPDATE budgets SET current_balance = current_balance + ${amount} WHERE category = ${toCat}`,
  ]);

  const newBalances = await getBalances(userKey);
  return { from_new_balance: newBalances[fromCat], to_new_balance: newBalances[toCat] };
}

export async function directDeposit(userKey: string, category: string, amount: number): Promise<number> {
  const balances = await getBalances(userKey);
  if (!(category in balances)) throw Object.assign(new Error(`Category '${category}' does not exist`), { status: 400 });

  const sql = getDb(userKey);
  await sql`UPDATE budgets SET current_balance = current_balance + ${amount} WHERE category = ${category}`;

  await saveIncomeRecord(userKey, amount, { [category]: amount });

  const newBalances = await getBalances(userKey);
  return newBalances[category];
}
