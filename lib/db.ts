import { neon } from "@neondatabase/serverless";

const CONNECTIONS: Record<string, string | undefined> = {
  neon: process.env.MH_NEON_DB_URL,
  pachi: process.env.MH_PACHI_DB_URL,
};

export function getDb(userKey: string) {
  const url = CONNECTIONS[userKey];
  if (!url) throw new Error(`Unknown user or missing DB URL for: ${userKey}`);
  return neon(url);
}
