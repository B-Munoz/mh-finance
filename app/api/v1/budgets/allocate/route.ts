import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { allocateIncome } from "@/lib/services/budget";
import { getEffectiveConfig } from "@/lib/services/settings";

export async function POST(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { income_amount } = await req.json();
    const cfg = await getEffectiveConfig(userKey);
    const allocations = await allocateIncome(userKey, income_amount, cfg.allocation_pct, cfg.limits);
    return Response.json({ allocations });
  } catch (err) {
    return apiError(err);
  }
}
