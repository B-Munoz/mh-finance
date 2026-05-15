import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { listIncomes } from "@/lib/services/income";

export async function GET(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    return Response.json(await listIncomes(userKey));
  } catch (err) {
    return apiError(err);
  }
}
