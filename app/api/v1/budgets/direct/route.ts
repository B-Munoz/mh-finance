import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { directDeposit } from "@/lib/services/budget";

export async function POST(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { category, amount } = await req.json();
    const new_balance = await directDeposit(userKey, category, amount);
    return Response.json({ category, amount, new_balance });
  } catch (err) {
    return apiError(err);
  }
}
