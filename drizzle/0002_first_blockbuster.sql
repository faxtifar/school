CREATE TABLE `messageAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `text` text;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `photoUrl`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `photoKey`;