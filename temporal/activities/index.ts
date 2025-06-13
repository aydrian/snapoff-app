export async function closeContest(contestId: string) {
  const res = await fetch("http://localhost:5173/internal/close-contest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.D1_INTERNAL_SECRET}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contestId })
  });

  if (!res.ok) {
    throw new Error(`Failed to close contest: ${res.statusText}`);
  }
}

export async function notifyUsers(contestId: string) {
  // Fetch users and send notifications (email, push, etc.)
  console.log(`Notifying users about contest ${contestId}`);
}
