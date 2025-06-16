import type { Route } from "./+types/contests._index";
import { Link } from "react-router";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  contests as contestsSchema,
  ContestStatus,
  entries,
  votes
} from "database/schema/contest.sql";
import { and, count, desc, eq, or, type SQL } from "drizzle-orm";
import { getAnonId } from "~/cookies.server";
import z from "zod";
import { parseWithZod } from "@conform-to/zod";

const ContestFilter = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  ENDED: "ended"
} as const;

const ContestFilterLabels = {
  [ContestFilter.SCHEDULED]: "📅 Scheduled",
  [ContestFilter.ACTIVE]: "🏃 Active",
  [ContestFilter.ENDED]: "🏁 Ended"
} as const;

const searchParamsSchema = z.object({
  filter: z
    .enum([ContestFilter.SCHEDULED, ContestFilter.ACTIVE, ContestFilter.ENDED])
    .default(ContestFilter.ACTIVE)
});

export async function loader({ context, request }: Route.LoaderArgs) {
  const { drizzle } = context.hono;
  const userId = await getAnonId(request);

  const url = new URL(request.url);
  const result = parseWithZod(url.searchParams, { schema: searchParamsSchema });

  if (result.status !== "success") {
    throw new Error("Invalid search params");
  }

  const { filter } = result.value;

  let statusCondition: SQL<unknown>;
  switch (filter) {
    case ContestFilter.SCHEDULED:
      statusCondition = eq(contestsSchema.status, ContestStatus.SCHEDULED);
      break;
    case ContestFilter.ACTIVE:
      statusCondition = or(
        eq(contestsSchema.status, ContestStatus.OPEN),
        eq(contestsSchema.status, ContestStatus.ENTRY_CLOSED)
      ) as SQL<unknown>;
      break;
    case ContestFilter.ENDED:
      statusCondition = eq(contestsSchema.status, ContestStatus.CLOSED);
      break;
    default:
      throw new Error("Invalid filter");
  }

  const contestsQuery = drizzle
    .select({
      id: contestsSchema.id,
      title: contestsSchema.title,
      description: contestsSchema.description,
      status: contestsSchema.status,
      startTime: contestsSchema.startTime,
      entryCutoffTime: contestsSchema.entryCutoffTime,
      votingEndTime: contestsSchema.votingEndTime,
      entryCount: count(entries.id).as("entryCount")
    })
    .from(contestsSchema)
    .leftJoin(entries, eq(contestsSchema.id, entries.contestId))
    .leftJoin(votes, eq(entries.id, votes.entryId))
    .where(
      and(
        or(eq(contestsSchema.ownerId, userId), eq(votes.userId, userId)),
        statusCondition
      )
    )
    .groupBy(contestsSchema.id)
    .orderBy(desc(contestsSchema.startTime));

  const contestsWithEntries = await contestsQuery;

  return { contests: contestsWithEntries, filter };
}

export default function ContestsPage({ loaderData }: Route.ComponentProps) {
  const { contests, filter } = loaderData;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  };

  const getEmptyStateContent = (filter: string) => {
    switch (filter) {
      case ContestFilter.SCHEDULED:
        return {
          message: "You don't have any scheduled contests.",
          subMessage: "Plan ahead and create a future contest!",
          ctaText: "Schedule a Contest",
          showCTA: true
        };
      case ContestFilter.ACTIVE:
        return {
          message:
            "You haven't created or participated in any active contests yet.",
          subMessage: "Start your first contest and join the fun!",
          ctaText: "Create Your First Contest",
          showCTA: true
        };
      case ContestFilter.ENDED:
        return {
          message: "You haven't participated in any ended contests.",
          subMessage: "Join or create a contest to see it here when it ends!",
          showCTA: false
        };
      default:
        return {
          message: "No contests found.",
          subMessage: "Try a different filter or create a new contest.",
          ctaText: "Create a Contest",
          showCTA: true
        };
    }
  };

  const emptyState = getEmptyStateContent(filter);

  return (
    <>
      <div className="space-y-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">My Contests</h2>
        </div>
        <nav className="flex space-x-2 mb-4">
          {(
            Object.keys(ContestFilter) as Array<keyof typeof ContestFilter>
          ).map((key) => (
            <Link
              key={key}
              to={`/contests?filter=${ContestFilter[key]}`}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === ContestFilter[key]
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {ContestFilterLabels[ContestFilter[key]]}
            </Link>
          ))}
        </nav>
        {contests.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {emptyState.message}
            </p>
            <p className="text-muted-foreground mb-6">
              {emptyState.subMessage}
            </p>
            {emptyState.showCTA && (
              <Link to="/contests/new">
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {emptyState.ctaText}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contests.map((contest) => (
              <Link to={`/contests/${contest.id}`} key={contest.id}>
                <Card className="hover:shadow-md transition">
                  <CardContent className="p-4">
                    <CardTitle>{contest.title}</CardTitle>
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
      <div className="fixed bottom-8 right-8">
        <Link to="/contests/new">
          <Button
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg"
          >
            Create Contest
          </Button>
        </Link>
      </div>
    </>
  );
}
