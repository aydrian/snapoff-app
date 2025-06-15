import { proxyActivities, sleep } from "@temporalio/workflow";

const { updateContestStatus } = proxyActivities<{
  updateContestStatus: (contestId: string, status: string) => Promise<void>;
}>({
  startToCloseTimeout: "60 seconds"
});

export async function contestLifecycleWorkflow(
  contestId: string,
  startTime: number,
  entryCutoffTime: number,
  votingEndTime: number
): Promise<void> {
  const now = Date.now();
  console.log(`Starting contest lifecycle workflow for contest ${contestId}`);

  if (startTime > now) {
    await sleep(startTime - now);
  }
  await updateContestStatus(contestId, "open");

  if (entryCutoffTime > Date.now()) {
    await sleep(entryCutoffTime - Date.now());
  }
  await updateContestStatus(contestId, "entry-closed");

  if (votingEndTime > Date.now()) {
    await sleep(votingEndTime - Date.now());
  }
  await updateContestStatus(contestId, "closed");
}
