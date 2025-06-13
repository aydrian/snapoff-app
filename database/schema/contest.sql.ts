import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const contests = sqliteTable("contests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: integer("start_time", { mode: "timestamp" }),
  endTime: integer("end_time", { mode: "timestamp" })
});

export const entries = sqliteTable("entries", {
  id: text("id").primaryKey(),
  contestId: text("contest_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  createdAt: integer("created_at", { mode: "timestamp" })
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  entryId: text("entry_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
});
