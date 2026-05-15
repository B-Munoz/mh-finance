import { NextRequest } from "next/server";
import { KNOWN_USERS, verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!KNOWN_USERS.includes(username) || !verifyPassword(username, password)) {
      return Response.json({ detail: "Invalid credentials" }, { status: 401 });
    }
    const access_token = await createToken(username);
    return Response.json({ access_token, token_type: "bearer" });
  } catch {
    return Response.json({ detail: "Invalid credentials" }, { status: 401 });
  }
}
