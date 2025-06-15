ALTER TABLE `contests` ADD `require_entry_approval` integer DEFAULT false NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`contest_id` text NOT NULL,
	`image_key` text NOT NULL,
	`caption` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`contest_id`) REFERENCES `contests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "contest_id", "image_key", "caption", "user_id", "created_at", "status") SELECT "id", "contest_id", "image_key", "caption", "user_id", "created_at", "status" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_votes`("id", "entry_id", "user_id", "created_at") SELECT "id", "entry_id", "user_id", "created_at" FROM `votes`;--> statement-breakpoint
DROP TABLE `votes`;--> statement-breakpoint
ALTER TABLE `__new_votes` RENAME TO `votes`;