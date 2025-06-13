import { Hono } from "hono";
import type { AppBindings } from "../../types";
import { z } from "zod";

const internal = new Hono<AppBindings>();

const schema = z.object({
  contestId: z.string()
});

internal.post("/internal/close-contest", async (c) => {
  const auth = c.req.header("Authorization");
  const expected = `Bearer ${c.env.D1_INTERNAL_SECRET}`;

  if (auth !== expected) {
    return c.text("Unauthorized", 401);
  }

  const body = await c.req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { contestId } = parsed.data;

  await c.env.DB.prepare(`UPDATE contests SET status = 'closed' WHERE id = ?`)
    .bind(contestId)
    .run();

  return c.json({ success: true });
});

export default internal;
