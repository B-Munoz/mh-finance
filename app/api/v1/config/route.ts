import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { getEffectiveConfig } from "@/lib/services/settings";

export async function GET(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    return Response.json(await getEffectiveConfig(userKey));
  } catch (err) {
    return apiError(err);
  }
}
