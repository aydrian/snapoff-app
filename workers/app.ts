import { Hono } from "hono";
import { logger } from "hono/logger";
import { createRequestHandler } from "react-router";
import type { AppBindings } from "./types";
import { initDb, type DBInstance } from "./db";
import internalRoutes from "./routes/internal/close-contest";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    hono: {
      drizzle: DBInstance;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

const app = new Hono<AppBindings>();

app.use("*", logger());

app.use(async (c, next) => {
  const drizzleClient = initDb(c.env);
  c.set("drizzle", drizzleClient);
  await next();
});

app.route("/", internalRoutes);

app.all("*", (c) => {
  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx as ExecutionContext },
    hono: { drizzle: c.var.drizzle }
  });
});

export default app;
