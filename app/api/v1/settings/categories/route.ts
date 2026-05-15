import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { addCategory } from "@/lib/services/settings";

export async function POST(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { name } = await req.json();
    await addCategory(userKey, name.trim());
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
