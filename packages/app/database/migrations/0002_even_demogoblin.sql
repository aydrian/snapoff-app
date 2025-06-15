ALTER TABLE `entries` RENAME COLUMN "image_url" TO "image_key";--> statement-breakpoint
ALTER TABLE `contests` ADD `owner_id` text NOT NULL;