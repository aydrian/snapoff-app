PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_time` integer NOT NULL,
	`entry_cutoff_time` integer NOT NULL,
	`voting_end_time` integer NOT NULL,
	`owner_id` text NOT NULL,
	`votes_per_user` integer DEFAULT 1 NOT NULL,
	`require_entry_approval` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_contests`("id", "title", "description", "start_time", "entry_cutoff_time", "voting_end_time", "owner_id", "votes_per_user", "require_entry_approval", "status", "created_at") SELECT "id", "title", "description", "start_time", "entry_cutoff_time", "voting_end_time", "owner_id", "votes_per_user", "require_entry_approval", "status", "created_at" FROM `contests`;--> statement-breakpoint
DROP TABLE `contests`;--> statement-breakpoint
ALTER TABLE `__new_contests` RENAME TO `contests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;