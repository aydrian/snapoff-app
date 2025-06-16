import { useOutletContext } from "react-router";
import { ContestEntryCard, voteSchema } from "~/components/ContestEntryCard";
import { getRandomRotation } from "~/lib/utils";
import type { OutletContext } from "./contests.$id";
import type { Route } from "./+types/contests.$id._index";
import {
  entries as entriesSchema,
  votes as votesSchema
} from "database/schema/contest.sql";
import { and, eq, sql } from "drizzle-orm";
import { getAnonId } from "~/cookies.server";
import { parseWithZod } from "@conform-to/zod";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const contestId = params.id;
  const userId = await getAnonId(request);
  const { drizzle } = context.hono;

  const entriesFromDB = await drizzle
    .select({
      id: entriesSchema.id,
      imageKey: entriesSchema.imageKey,
      caption: entriesSchema.caption,
      userId: entriesSchema.userId,
      votes: sql<number>`count(${votesSchema.id})`.as("votes")
    })
    .from(entriesSchema)
    .leftJoin(votesSchema, eq(entriesSchema.id, votesSchema.entryId))
    .where(eq(entriesSchema.contestId, contestId))
    .groupBy(entriesSchema.id)
    .orderBy(sql`votes DESC`);

  const userVotes = await drizzle
    .select({ entryId: votesSchema.entryId })
    .from(votesSchema)
    .innerJoin(entriesSchema, eq(votesSchema.entryId, entriesSchema.id))
    .where(
      and(
        eq(votesSchema.userId, userId),
        eq(entriesSchema.contestId, contestId)
      )
    );

  const userVotedEntryIds = userVotes.map((vote) => vote.entryId);
  const userVoteCount = userVotedEntryIds.length;

  const entries = await Promise.all(
    entriesFromDB.map(async (entry) => {
      const imageUrl = entry.imageKey ? `/images/${entry.imageKey}` : null;
      return {
        ...entry,
        imageUrl: imageUrl || "",
        hasVoted: userVotedEntryIds.includes(entry.id),
        isOwnEntry: entry.userId === userId
      };
    })
  );

  const rotations = entries.map(() => getRandomRotation());

  return { entries, userVoteCount, rotations };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { drizzle } = context.hono;
  const userId = await getAnonId(request);
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "vote") {
    const submission = parseWithZod(formData, { schema: voteSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { entryId } = submission.value;

    // Check if the user has already voted on this entry
    const existingVote = await drizzle
      .select()
      .from(votesSchema)
      .where(and(
        eq(votesSchema.entryId, entryId),
        eq(votesSchema.userId, userId)
      ))
      .limit(1);

    if (existingVote.length > 0) {
      // User has already voted, so delete the vote
      await drizzle
        .delete(votesSchema)
        .where(and(
          eq(votesSchema.entryId, entryId),
          eq(votesSchema.userId, userId)
        ));
    } else {
      // User hasn't voted, so insert a new vote
      await drizzle
        .insert(votesSchema)
        .values({
          id: crypto.randomUUID(),
          entryId,
          userId,
          createdAt: new Date()
        });
    }

    return submission.reply();
  }
}

export default function ContestPage({ loaderData }: Route.ComponentProps) {
  const { entries, userVoteCount, rotations } = loaderData;
  const { isVotingOpen, votesPerUser } = useOutletContext<OutletContext>();
  const remainingVotes = votesPerUser - userVoteCount;

  return (
    <>
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

        <div className="flex justify-center overflow-x-auto p-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {entries.map((entry, index) => (
            <ContestEntryCard
              key={entry.id}
              entry={entry}
              rotation={rotations[index]}
              hasVoted={entry.hasVoted}
            />
          ))}
        </div>
      </section>
    </>
  );
}