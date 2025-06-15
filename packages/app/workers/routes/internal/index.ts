import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import type { AppBindings } from "../../app";
import contestsRouter from "./contests";

const internal = new Hono<AppBindings>();

// Apply bearer auth middleware to all routes
internal.use(
  "*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.D1_INTERNAL_SECRET;
    }
  })
);

internal.route("/contests", contestsRouter);

export default internal;
