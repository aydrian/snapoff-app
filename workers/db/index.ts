import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import schema from "../../database/schema";

/**
 * Alias for our Drizzle D1 database instance type.
 */
export type DBInstance = DrizzleD1Database<typeof schema>;

/**
 * Initialize a Drizzle D1 database instance from the Cloudflare D1 binding.
 */
export function initDb(env: Env): DBInstance {
  return drizzle(env.DB, { schema });
}
