CREATE TABLE `adminCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminCredentials_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `embedCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('submit_deal_form','contact_calendar') NOT NULL,
	`code` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embedCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `embedCodes_type_unique` UNIQUE(`type`)
);
--> statement-breakpoint
CREATE TABLE `quickLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`url` text,
	`displayOrder` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quickLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resourceLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`url` text,
	`displayOrder` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resourceLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `resourceLinks_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `socialLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('facebook','instagram','linkedin','youtube') NOT NULL,
	`url` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialLinks_platform_unique` UNIQUE(`platform`)
);
