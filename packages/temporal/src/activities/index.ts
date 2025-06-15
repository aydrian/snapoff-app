export async function updateContestStatus(contestId: string, status: string) {
  console.log(`Updating contest status for ${contestId} to ${status}`);
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
}

export async function notifyUsers(contestId: string) {
  // Fetch users and send notifications (email, push, etc.)
  console.log(`Notifying users about contest ${contestId}`);
}
