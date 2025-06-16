import type { Route } from "./+types/contests._index";
import { Link } from "react-router";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  contests as contestsSchema,
  entries
} from "database/schema/contest.sql";
import { eq, count, desc } from "drizzle-orm";

export async function loader({ context }: Route.LoaderArgs) {
  const { drizzle } = context.hono;
  const contestsWithEntries = await drizzle
    .select({
      id: contestsSchema.id,
      title: contestsSchema.title,
      description: contestsSchema.description,
      status: contestsSchema.status,
      startTime: contestsSchema.startTime,
      votingEndTime: contestsSchema.votingEndTime,
      entryCount: count(entries.id).as("entryCount")
    })
    .from(contestsSchema)
    .leftJoin(entries, eq(contestsSchema.id, entries.contestId))
    .groupBy(contestsSchema.id)
    .orderBy(desc(contestsSchema.startTime));

  return { contests: contestsWithEntries };
}

export default function ContestsPage({ loaderData }: Route.ComponentProps) {
  const { contests } = loaderData;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Active Contests</h2>
        <Link to="/contests/new">
          <Button
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg"
          >
            Create Contest
          </Button>
        </Link>
      </div>
      {contests.length === 0 ? (
        <p className="text-muted-foreground">
          No contests available right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contests.map((contest) => (
            <Link to={`/contests/${contest.id}`} key={contest.id}>
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle>{contest.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {contest.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    🕒 Start: {formatDate(contest.startTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🏁 End: {formatDate(contest.votingEndTime)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contest.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    📸 {contest.entryCount}{" "}
                    {contest.entryCount === 1 ? "Entry" : "Entries"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
