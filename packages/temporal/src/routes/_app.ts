import { z } from "zod";
import client from "../lib/temporal.js";
import { contestLifecycleWorkflow } from "../workflows";
import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  startContestLifecycle: publicProcedure
    .input(
      z.object({
        contestId: z.string().uuid(),
        startTime: z.number().int().positive(),
        entryCutoffTime: z.number().int().positive(),
        votingEndTime: z.number().int().positive()
      })
    )
    .mutation(async ({ input }) => {
      const { contestId, startTime, entryCutoffTime, votingEndTime } = input;
      try {
        const handle = await client.workflow.start(contestLifecycleWorkflow, {
          taskQueue: "contest-queue",
          workflowId: `contest-${contestId}`,
          args: [contestId, startTime, entryCutoffTime, votingEndTime]
        });
        return { workflowId: handle.workflowId };
      } catch (error) {
        console.error("Error starting workflow:", error);
        throw new Error("Failed to start workflow");
      }
    })
});

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter;
