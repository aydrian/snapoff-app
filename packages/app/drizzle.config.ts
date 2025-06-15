import type { Config } from "drizzle-kit";
import { env } from "./env";

export default {
  out: "./database/migrations",
  schema: "./database/schema/**.sql.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_D1_TOKEN
  }
} satisfies Config;
