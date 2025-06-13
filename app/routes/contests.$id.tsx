import type { Route } from "./+types/contests.$id";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { contests } from "database/schema/contest.sql";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { drizzle } = context.hono;
  const result = await drizzle
    .select()
    .from(contests)
    .where(eq(contests.id, params.id))
    .limit(1);
  if (!result) throw new Response("Not Found", { status: 404 });
  return { contest: result[0] };
}

export default function ContestPage({ loaderData }: Route.ComponentProps) {
  const { contest } = loaderData;

  // Placeholder data
  const phase = "Voting Open";
  const entriesCount = 124;
  const votesCount = 1032;
  const entries = [
    {
      id: 1,
      imageUrl: "https://picsum.photos/id/237/200",
      caption: "Ugly Sweater 1",
      votes: 42
    },
    {
      id: 2,
      imageUrl: "https://picsum.photos/id/274/200",
      caption: "Ugly Sweater 2",
      votes: 87
    },
    {
      id: 3,
      imageUrl: "https://picsum.photos/id/281/200",
      caption: "Ugly Sweater 3",
      votes: 19
    }
  ];
  const isContestOver = false;
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

  // Function to generate a random rotation between -5 and 5 degrees
  const getRandomRotation = () => {
    return Math.floor(Math.random() * 11) - 5; // Random number between -5 and 5
  };

  // Mock data for remaining votes
  const remainingVotes = 3; // This should be fetched from the user's data in a real scenario

  // Determine if voting is open (you might want to replace this with actual logic based on contest dates)
  const isVotingOpen = phase === "Voting Open";

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          🎄 {contest.title}
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          {contest.description}
        </p>
        <p className="text-lg mt-4">
          📅 {safeFormatDate(contest.startTime)} –{" "}
          {safeFormatDate(contest.endTime)}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Badge variant="secondary" className="text-sm px-2 py-1">
            🕒 {phase}
          </Badge>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ⏳ Time Remaining:
            </p>
            <p className="text-base font-medium">
              {safeTimeRemaining(contest.endTime)}
            </p>
          </div>
        </div>
      </section>

      {/* Entry Gallery */}
      <section className="overflow-hidden -mx-4 sm:mx-0">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-900 dark:text-white text-center">
          📸 Entry Gallery
        </h2>

        {/* Voting Instructions */}
        {isVotingOpen && (
          <div className="rounded-lg mb-3 text-sm text-center">
            <p className="text-blue-700 dark:text-blue-300">
              Click ❤️ to vote.
            </p>
            {remainingVotes > 0 ? (
              <p className=" text-gray-700 dark:text-gray-300">
                You have{" "}
                <span className="font-bold text-green-600 dark:text-green-400">
                  {remainingVotes}
                </span>{" "}
                votes remaining. Choose wisely!
              </p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                You've used all your votes!
              </p>
            )}
          </div>
        )}

        <div className="flex overflow-x-auto p-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex-shrink-0 w-[calc(70vw-2rem)] sm:w-full mx-2 first:ml-4 last:mr-4 sm:mx-0 snap-center"
            >
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-0"
                style={{
                  transform: `rotate(${getRandomRotation()}deg)`,
                  transition: "transform 0.3s ease-in-out"
                }}
              >
                <div className="p-2 sm:p-3">
                  <div className="relative pb-[90%] bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={entry.imageUrl}
                      alt={entry.caption}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <Button
                      className="absolute bottom-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-110"
                      onClick={() => {
                        /* Add your vote logic here */
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 sm:p-3 pt-0">
                  <p className="text-xs sm:text-sm text-center font-medium mb-1 text-gray-800 dark:text-gray-100">
                    {entry.caption}
                  </p>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-300">
                    ❤️ {entry.votes} votes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Stats */}
      <section className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-md">
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
        <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
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
  );
}
