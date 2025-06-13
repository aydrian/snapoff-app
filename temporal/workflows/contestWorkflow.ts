import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities";

const { closeContest, notifyUsers } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute"
});

export interface ContestWorkflowArgs {
  contestId: string;
  endTime: Date; // ISO string
}

export async function contestWorkflow({
  contestId,
  endTime
}: ContestWorkflowArgs) {
  const delay = endTime.getTime() - Date.now();

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  await closeContest(contestId);
  await notifyUsers(contestId);
}
