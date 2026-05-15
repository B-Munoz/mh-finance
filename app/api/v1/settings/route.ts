import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { getSettings, saveSettings, getEffectiveConfig } from "@/lib/services/settings";

export async function GET(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    return Response.json(await getSettings(userKey));
  } catch (err) {
    return apiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const body: { allocation_pct?: Record<string, number>; category_limits?: Record<string, number> } = await req.json();
    const effective = await getEffectiveConfig(userKey);

    if (body.allocation_pct) {
      const known = new Set(Object.keys(effective.allocation_pct));
      for (const cat of Object.keys(body.allocation_pct)) {
        if (!known.has(cat)) return Response.json({ detail: `Unknown category: ${cat}` }, { status: 400 });
      }
      const total = Object.values(body.allocation_pct).reduce((s, v) => s + v, 0);
      if (total > 1.0 + 1e-9) return Response.json({ detail: `Allocation percentages sum to ${(total * 100).toFixed(2)}%, must be ≤ 100%` }, { status: 400 });
    }

    if (body.category_limits) {
      const known = new Set(Object.keys(effective.limits));
      for (const cat of Object.keys(body.category_limits)) {
        if (!known.has(cat)) return Response.json({ detail: `Unknown category: ${cat}` }, { status: 400 });
      }
    }

    await saveSettings(userKey, body.allocation_pct ?? null, body.category_limits ?? null);
    return Response.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
