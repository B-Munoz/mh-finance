import { getDb } from "../db";
import { DEFAULT_CONFIG, type UserConfig } from "../defaults";

async function getDbRows(userKey: string): Promise<Record<string, string>> {
  try {
    const sql = getDb(userKey);
    const rows = await sql`SELECT key, value FROM user_settings`;
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key as string] = row.value as string;
    return map;
  } catch {
    return {};
  }
}

async function saveCategoryState(
  userKey: string,
  names: string[],
  allocation_pct: Record<string, number>,
  limits: Record<string, number>,
) {
  const sql = getDb(userKey);
  await sql.transaction([
    sql`INSERT INTO user_settings (key, value) VALUES ('category_names', ${JSON.stringify(names)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    sql`INSERT INTO user_settings (key, value) VALUES ('allocation_pct', ${JSON.stringify(allocation_pct)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    sql`INSERT INTO user_settings (key, value) VALUES ('category_limits', ${JSON.stringify(limits)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  ]);
}

export async function getEffectiveConfig(userKey: string): Promise<UserConfig> {
  const fallback = DEFAULT_CONFIG[userKey] ?? DEFAULT_CONFIG.neon;
  const rows = await getDbRows(userKey);

  let categories = [...fallback.categories];
  let allocation_pct = { ...fallback.allocation_pct };
  let limits = { ...fallback.limits };

  if (rows.allocation_pct) allocation_pct = JSON.parse(rows.allocation_pct);
  if (rows.category_limits) limits = JSON.parse(rows.category_limits);
  if (rows.category_names) {
    categories = JSON.parse(rows.category_names);
    allocation_pct = Object.fromEntries(categories.map((n) => [n, allocation_pct[n] ?? 0]));
    limits = Object.fromEntries(categories.map((n) => [n, limits[n] ?? 0]));
  }

  return { categories, allocation_pct, limits };
}

export async function getSettings(userKey: string) {
  const cfg = await getEffectiveConfig(userKey);
  return { allocation_pct: cfg.allocation_pct, category_limits: cfg.limits };
}

export async function saveSettings(
  userKey: string,
  allocation_pct: Record<string, number> | null,
  category_limits: Record<string, number> | null,
) {
  const sql = getDb(userKey);
  const queries = [];
  if (allocation_pct !== null) {
    queries.push(
      sql`INSERT INTO user_settings (key, value) VALUES ('allocation_pct', ${JSON.stringify(allocation_pct)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    );
  }
  if (category_limits !== null) {
    queries.push(
      sql`INSERT INTO user_settings (key, value) VALUES ('category_limits', ${JSON.stringify(category_limits)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    );
  }
  if (queries.length > 0) await sql.transaction(queries);
}

export async function addCategory(userKey: string, name: string) {
  const effective = await getEffectiveConfig(userKey);
  if (effective.categories.includes(name)) throw Object.assign(new Error(`Category '${name}' already exists`), { status: 409 });

  const sql = getDb(userKey);
  await sql`INSERT INTO budgets (category, current_balance) VALUES (${name}, 0) ON CONFLICT (category) DO NOTHING`;

  const names = [...effective.categories, name];
  const alloc_pct = { ...effective.allocation_pct, [name]: 0 };
  const limits = { ...effective.limits, [name]: 0 };
  await saveCategoryState(userKey, names, alloc_pct, limits);
}

export async function deleteCategory(userKey: string, name: string) {
  const sql = getDb(userKey);
  const rows = await sql`SELECT current_balance FROM budgets WHERE category = ${name}`;
  if (!rows.length) throw Object.assign(new Error(`Category '${name}' not found`), { status: 409 });
  if ((rows[0].current_balance as number) > 0) {
    throw Object.assign(
      new Error(`Category '${name}' has a remaining balance of ${rows[0].current_balance}. Transfer it out before deleting.`),
      { status: 409 },
    );
  }

  const effective = await getEffectiveConfig(userKey);
  await sql`DELETE FROM budgets WHERE category = ${name}`;

  const names = effective.categories.filter((n) => n !== name);
  const alloc_pct = Object.fromEntries(Object.entries(effective.allocation_pct).filter(([k]) => k !== name));
  const limits = Object.fromEntries(Object.entries(effective.limits).filter(([k]) => k !== name));
  await saveCategoryState(userKey, names, alloc_pct, limits);
}

export async function renameCategory(userKey: string, oldName: string, newName: string) {
  const effective = await getEffectiveConfig(userKey);
  if (!effective.categories.includes(oldName)) throw Object.assign(new Error(`Category '${oldName}' not found`), { status: 409 });
  if (effective.categories.includes(newName)) throw Object.assign(new Error(`Category '${newName}' already exists`), { status: 409 });

  const sql = getDb(userKey);
  await sql`UPDATE budgets SET category = ${newName} WHERE category = ${oldName}`;

  const names = effective.categories.map((n) => (n === oldName ? newName : n));
  const alloc_pct = Object.fromEntries(
    Object.entries(effective.allocation_pct).map(([k, v]) => [k === oldName ? newName : k, v]),
  );
  const limits = Object.fromEntries(
    Object.entries(effective.limits).map(([k, v]) => [k === oldName ? newName : k, v]),
  );
  await saveCategoryState(userKey, names, alloc_pct, limits);
}
