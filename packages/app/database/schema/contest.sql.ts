import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const ContestStatus = {
  SCHEDULED: "scheduled",
  OPEN: "open",
  ENTRY_CLOSED: "entry-closed",
  CLOSED: "closed"
} as const;

export type ContestStatus = (typeof ContestStatus)[keyof typeof ContestStatus];

// Define the entry status enum
export const EntryStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

export type EntryStatus = (typeof EntryStatus)[keyof typeof EntryStatus];

export const contests = sqliteTable("contests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: integer("start_time", { mode: "timestamp" }), // when voting/entry starts
  entryCutoffTime: integer("entry_cutoff_time", { mode: "timestamp" }), // when entries close
  votingEndTime: integer("voting_end_time", { mode: "timestamp" }), // when voting ends
  endTime: integer("end_time", { mode: "timestamp" }),
  ownerId: text("owner_id").notNull(),
  votesPerUser: integer("votes_per_user").notNull().default(1),
  requireEntryApproval: integer("require_entry_approval", { mode: "boolean" })
    .notNull()
    .default(false),
  status: text("status")
    .notNull()
    .default(ContestStatus.SCHEDULED)
    .$type<ContestStatus>(),
  createdAt: integer("created_at", { mode: "timestamp" })
});

export const entries = sqliteTable("entries", {
  id: text("id").primaryKey(),
  contestId: text("contest_id")
    .notNull()
    .references(() => contests.id),
  imageKey: text("image_key").notNull(),
  caption: text("caption").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  status: text("status")
    .notNull()
    .default(EntryStatus.PENDING)
    .$type<EntryStatus>()
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  entryId: text("entry_id")
    .notNull()
    .references(() => entries.id),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
});
