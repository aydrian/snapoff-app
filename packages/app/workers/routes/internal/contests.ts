import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppBindings } from "../../app";
import { z } from "zod";
import { ContestStatus, contests } from "database/schema/contest.sql";
import { eq } from "drizzle-orm";

const contestsRouter = new Hono<AppBindings>();

const paramsSchema = z.object({
  id: z.string().uuid()
});

const bodySchema = z.object({
  status: z.enum([
    ContestStatus.OPEN,
    ContestStatus.ENTRY_CLOSED,
    ContestStatus.CLOSED
  ])
});

contestsRouter.post(
  "/:id/status",
  zValidator("param", paramsSchema),
  zValidator("json", bodySchema),
  async (c) => {
    const { id: contestId } = c.req.valid("param");
    const { status } = c.req.valid("json");
    console.log(`Updating contest status for ${contestId} to ${status}`);

    try {
      const result = await c.var.drizzle
        .update(contests)
        .set({ status })
        .where(eq(contests.id, contestId))
        .returning({ updatedId: contests.id });

      if (result.length === 0) {
        return c.json({ error: "Contest not found" }, 404);
      }

      return c.json({ success: true, contestId, newStatus: status });
    } catch (error) {
      console.error("Error updating contest status:", error);
      return c.json({ error: "Failed to update contest status" }, 500);
    }
  }
);

export default contestsRouter;
