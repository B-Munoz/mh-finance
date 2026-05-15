import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { relocateBudget } from "@/lib/services/budget";

export async function POST(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { from_category, to_category, amount } = await req.json();
    const result = await relocateBudget(userKey, from_category, to_category, amount);
    return Response.json({ from_category, to_category, amount, ...result });
  } catch (err) {
    return apiError(err);
  }
}
