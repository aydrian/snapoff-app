ALTER TABLE `contests` ADD `entry_cutoff_time` integer;--> statement-breakpoint
ALTER TABLE `contests` ADD `voting_end_time` integer;--> statement-breakpoint
ALTER TABLE `contests` ADD `status` text DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE `contests` ADD `created_at` integer;