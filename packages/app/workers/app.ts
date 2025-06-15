import { Hono } from "hono";
import { logger } from "hono/logger";
import { createRequestHandler } from "react-router";
import { schema, type DBInstance } from "database";
import internalRoutes from "./routes/internal";
import { showRoutes } from "hono/dev";
import { drizzle } from "drizzle-orm/d1";

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

export interface AppBindings {
  Bindings: Env;
  Variables: {
    drizzle: DBInstance;
  };
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

const app = new Hono<AppBindings>();

app.use("*", logger());

app.use(async (c, next) => {
  const drizzleClient = drizzle(c.env.DB, { schema });
  c.set("drizzle", drizzleClient);
  await next();
});

app.route("/internal", internalRoutes);

app.all("*", (c) => {
  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx as ExecutionContext },
    hono: { drizzle: c.var.drizzle }
  });
});

showRoutes(app);

export default app;
