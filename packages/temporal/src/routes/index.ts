import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import client from "../lib/temporal.js";
import { contestLifecycleWorkflow } from "../workflows/index.js";
import env from "../env.js";

const internal = new Hono();

// Apply bearer auth middleware to all routes
internal.use("*", bearerAuth({ token: env.TW_INTERNAL_SECRET }));

// Define the schema for request parameters
const paramsSchema = z.object({
  contestId: z.string().uuid()
});

// Define the schema for request body
const bodySchema = z.object({
  startTime: z.number().int().positive(),
  entryCutoffTime: z.number().int().positive(),
  votingEndTime: z.number().int().positive()
});

internal.post(
  "/workflow/contestLifecycle/:contestId/start",
  zValidator("param", paramsSchema),
  zValidator("json", bodySchema),
  async (c) => {
    const { contestId } = c.req.valid("param");
    const { startTime, entryCutoffTime, votingEndTime } = c.req.valid("json");

    try {
      const handle = await client.workflow.start(contestLifecycleWorkflow, {
        taskQueue: "contest-queue",
        workflowId: `contest-${contestId}`,
        args: [contestId, startTime, entryCutoffTime, votingEndTime]
      });
      return c.json({ workflowId: handle.workflowId }, 201);
    } catch (error) {
      console.error("Error starting workflow:", error);
      return c.json({ error: "Failed to start workflow" }, 500);
    }
  }
);

export default internal;