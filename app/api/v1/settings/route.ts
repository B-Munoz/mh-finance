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
    const body: {
      allocation_pct?: Record<string, number>;
      category_limits?: Record<string, number>;
      allocation_mode?: "percentage" | "amount";
      allocation_total?: number;
      allocation_amounts?: Record<string, number>;
    } = await req.json();
    const effective = await getEffectiveConfig(userKey);

    if (body.allocation_pct) {
      const known = new Set(Object.keys(effective.allocation_pct));
      for (const cat of Object.keys(body.allocation_pct)) {
        if (!known.has(cat)) return Response.json({ detail: `Unknown category: ${cat}` }, { status: 400 });
      }
      const total = Object.values(body.allocation_pct).reduce((s, v) => s + v, 0);
      if (total > 1.0 + 1e-9) return Response.json({ detail: `Allocation percentages sum to ${(total * 100).toFixed(2)}%, must be ≤ 100%` }, { status: 400 });
    }

    if (body.allocation_mode !== undefined && body.allocation_mode !== "percentage" && body.allocation_mode !== "amount") {
      return Response.json({ detail: "Allocation mode must be percentage or amount" }, { status: 400 });
    }

    if (body.allocation_amounts) {
      const known = new Set(effective.categories);
      for (const [cat, amount] of Object.entries(body.allocation_amounts)) {
        if (!known.has(cat)) return Response.json({ detail: `Unknown category: ${cat}` }, { status: 400 });
        if (!Number.isFinite(amount) || amount < 0) {
          return Response.json({ detail: `Allocation amount for ${cat} must be a non-negative number` }, { status: 400 });
        }
      }
    }

    const allocationMode = body.allocation_mode ?? effective.allocation_mode;
    if (allocationMode === "amount") {
      const total = body.allocation_total ?? effective.allocation_total;
      if (!Number.isFinite(total) || total <= 0) {
        return Response.json({ detail: "Total allocation amount must be greater than zero" }, { status: 400 });
      }
      const amounts = body.allocation_amounts ?? effective.allocation_amounts;
      if (effective.categories.some((cat) => !(cat in amounts))) {
        return Response.json({ detail: "An allocation amount is required for every category" }, { status: 400 });
      }
      const assigned = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
      if (Math.abs(assigned - total) > 0.01) {
        return Response.json({ detail: "Category allocation amounts must add up to the total allocation amount" }, { status: 400 });
      }
    }

    if (body.category_limits) {
      const known = new Set(Object.keys(effective.limits));
      for (const cat of Object.keys(body.category_limits)) {
        if (!known.has(cat)) return Response.json({ detail: `Unknown category: ${cat}` }, { status: 400 });
      }
    }

    await saveSettings(
      userKey,
      body.allocation_pct ?? null,
      body.category_limits ?? null,
      body.allocation_mode ?? null,
      body.allocation_total ?? null,
      body.allocation_amounts ?? null,
    );
    return Response.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
