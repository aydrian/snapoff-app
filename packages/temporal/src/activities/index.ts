import { log } from "@temporalio/activity";

export async function updateContestStatus(contestId: string, status: string) {
  log.info(`Updating contest status for ${contestId} to ${status}`);
  const res = await fetch(
    `http://localhost:5173/internal/contests/${contestId}/status`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer super-secret-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to update contest status: ${res.statusText}`);
  }
  log.info(
    `Contest status updated successfully!  New status: ${status}  Contest ID: ${contestId}`
  );
  const data = await res.json();
  return data;
}

export async function notifyUsers(contestId: string) {
  // Fetch users and send notifications (email, push, etc.)
  log.info(`Notifying users about contest ${contestId}`);
}
