PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`contest_id` text NOT NULL,
	`image_key` text NOT NULL,
	`caption` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "contest_id", "image_key", "caption", "user_id", "created_at") SELECT "id", "contest_id", "image_key", "caption", "user_id", "created_at" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `contests` ADD `votes_per_user` integer DEFAULT 1 NOT NULL;