import { NextRequest } from "next/server";
import { decodeToken } from "./auth";

export async function requireUser(req: NextRequest): Promise<{ username: string; userKey: string }> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw Object.assign(new Error("Missing token"), { status: 401 });
  const username = await decodeToken(token);
  return { username, userKey: username };
}

export function apiError(err: unknown) {
  const e = err as { status?: number; message?: string };
  const status = e.status ?? 500;
  const detail = e.message ?? "Internal server error";
  if (status >= 500) console.error("[api error]", err);
  return Response.json({ detail }, { status });
}
