import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { getBalances } from "@/lib/services/budget";
import { getEffectiveConfig } from "@/lib/services/settings";

export async function GET(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const [cfg, balances] = await Promise.all([getEffectiveConfig(userKey), getBalances(userKey)]);
    const result = Object.entries(cfg.limits).map(([category, limit]) => ({
      category,
      current_balance: balances[category] ?? 0,
      limit,
    }));
    return Response.json(result);
  } catch (err) {
    return apiError(err);
  }
}
