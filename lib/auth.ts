import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
const EXPIRE = "30d";

const CREDENTIALS: Record<string, string | undefined> = {
  neon: process.env.MH_NEON_PASSWORD,
  pachi: process.env.MH_PACHI_PASSWORD,
};

export const KNOWN_USERS = ["neon", "pachi"];

function secret() {
  const key = process.env.JWT_SECRET_KEY;
  if (!key) throw new Error("JWT_SECRET_KEY is not set");
  return new TextEncoder().encode(key);
}

export function verifyPassword(username: string, password: string): boolean {
  const stored = CREDENTIALS[username] ?? "";
  return stored !== "" && password === stored;
}

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime(EXPIRE)
    .sign(secret());
}

export async function decodeToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret());
  if (!payload.sub) throw new Error("Invalid token payload");
  return payload.sub;
}
