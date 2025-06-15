import type { DrizzleD1Database } from "drizzle-orm/d1";
import schema from "./schema";

/**
 * Alias for our Drizzle D1 database instance type.
 */
export type DBInstance = DrizzleD1Database<typeof schema>;

export { schema };
