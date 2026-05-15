import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { saveBulkData } from "@/lib/services/expense";

export async function PUT(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { expenses } = await req.json();
    await saveBulkData(userKey, expenses);
    return new Response(null, { status: 204 });
  } catch (err) {
    return apiError(err);
  }
}
