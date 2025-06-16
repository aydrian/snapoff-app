import type { Route } from "./+types/contests.$id";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import {
  contests,
  ContestStatus,
  entries,
  votes
} from "database/schema/contest.sql";
import { and, eq, count } from "drizzle-orm";

import { Link, Outlet } from "react-router";
import { getAnonId } from "~/cookies.server";
import { Button } from "~/components/ui/button";

export type OutletContext = {
  isVotingOpen: boolean;
  votesPerUser: number;
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { drizzle } = context.hono;
  const contestId = params.id;
  const userId = await getAnonId(request);

  const [contestResult, entriesCount, votesCount, userEntry] =
    await Promise.all([
      drizzle
        .select()
        .from(contests)
        .where(eq(contests.id, contestId))
        .limit(1),
      drizzle
        .select({ count: count() })
        .from(entries)
        .where(eq(entries.contestId, contestId)),
      drizzle
        .select({ count: count() })
        .from(votes)
        .innerJoin(entries, eq(entries.id, votes.entryId))
        .where(eq(entries.contestId, contestId)),
      drizzle
        .select()
        .from(entries)
        .where(
          and(eq(entries.contestId, contestId), eq(entries.userId, userId))
        )
        .limit(1)
    ]);

  if (!contestResult.length) throw new Response("Not Found", { status: 404 });

  return {
    contest: contestResult[0],
    entriesCount: entriesCount[0].count,
    votesCount: votesCount[0].count,
    hasUserSubmitted: userEntry.length > 0
  };
}

export default function ContestLayout({ loaderData }: Route.ComponentProps) {
  const { contest, entriesCount, votesCount, hasUserSubmitted } = loaderData;

  const isVotingOpen = [
    ContestStatus.OPEN.toString(),
    ContestStatus.ENTRY_CLOSED.toString()
  ].includes(contest.status);
  const isEntryOpen = contest.status === ContestStatus.OPEN;
  const isContestOver = contest.status === ContestStatus.CLOSED;

  // Placeholder data
  const winner = { name: "Entry 1", votes: 312 };
  const runnerUp = { name: "Entry 2", votes: 278 };

  // Helper function to safely format date
  const safeFormatDate = (date: Date | null): string => {
    return date ? format(date, "MMM d") : "TBA";
  };

  // Helper function to safely calculate time remaining
  const safeTimeRemaining = (date: Date | null): string => {
    return date ? formatDistanceToNow(date, { addSuffix: true }) : "TBA";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="space-y-8 sm:space-y-12 pb-8">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h1 className="text-3xl font-permanent-marker sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {contest.title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {contest.description}
            </p>
            <p className="text-lg mt-4">
              📅 {safeFormatDate(contest.startTime)} –{" "}
              {safeFormatDate(contest.votingEndTime)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Badge variant="secondary" className="text-sm px-2 py-1">
                🕒 {contest.status}
              </Badge>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ⏳ Time Remaining:
                </p>
                <p className="text-base font-medium">
                  {safeTimeRemaining(contest.votingEndTime)}
                </p>
              </div>
            </div>
            {/* Add Submit Entry Button */}
            {isEntryOpen && !hasUserSubmitted && (
              <div className="mt-6">
                <Link to={`/contests/${contest.id}/entries/new`}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-full shadow-lg">
                    Submit Your Entry
                  </Button>
                </Link>
              </div>
            )}
          </section>

          <Outlet
            context={{ isVotingOpen, votesPerUser: contest.votesPerUser }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-100 dark:bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Live Stats */}
          <section className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow-md">
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
              🔥 Live Stats
            </h2>
            <div className="flex justify-center space-x-6 text-base text-gray-700 dark:text-gray-300">
              <p>📸 {entriesCount} Entries</p>
              <p>❤️ {votesCount} Votes</p>
            </div>
          </section>

          {/* Results Banner (only if contest is over) */}
          {isContestOver && (
            <section className="bg-white dark:bg-gray-700 p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                🏆 Results
              </h2>
              <p className="text-sm sm:text-base mb-1 text-gray-700 dark:text-gray-300">
                🥇 Winner: {winner.name} with {winner.votes} votes
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                🥈 Runner-up: {runnerUp.name} with {runnerUp.votes} votes
              </p>
            </section>
          )}
        </div>
      </footer>
    </div>
  );
}
