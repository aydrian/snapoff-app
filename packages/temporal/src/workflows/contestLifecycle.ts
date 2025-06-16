import {
  ApplicationFailure,
  proxyActivities,
  sleep,
  log
} from "@temporalio/workflow";
import type * as activities from "../activities";

const { updateContestStatus } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute"
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', { 
    dateStyle: 'short', 
    timeStyle: 'medium' 
  });
}

export async function contestLifecycleWorkflow(
  contestId: string,
  startTime: number,
  entryCutoffTime: number,
  votingEndTime: number
): Promise<void> {
  log.info(`Starting contest lifecycle workflow for contest ${contestId}`);

  const now = Date.now();
  log.info(`Current time: ${formatDate(now)}, Start time: ${formatDate(startTime)}`);

  if (startTime > now) {
    log.info(`Sleeping until start time: ${formatDate(startTime)}`);
    await sleep(startTime - now);
  }

  log.info(`Updating contest status to 'open'`);
  await updateContestStatus(contestId, "open").catch((err) => {
    throw new ApplicationFailure(
      `Failed to update contest status to open: ${err.message}`
    );
  });

  if (entryCutoffTime > Date.now()) {
    log.info(`Sleeping until entry cutoff time: ${formatDate(entryCutoffTime)}`);
    await sleep(entryCutoffTime - Date.now());
  }

  log.info(`Updating contest status to 'entry-closed'`);
  await updateContestStatus(contestId, "entry-closed").catch((err) => {
    throw new ApplicationFailure(
      `Failed to update contest status to entry-closed: ${err.message}`
    );
  });

  if (votingEndTime > Date.now()) {
    log.info(`Sleeping until voting end time: ${formatDate(votingEndTime)}`);
    await sleep(votingEndTime - Date.now());
  }

  log.info(`Updating contest status to 'closed'`);
  await updateContestStatus(contestId, "closed").catch((err) => {
    throw new ApplicationFailure(
      `Failed to update contest status to closed: ${err.message}`
    );
  });
}