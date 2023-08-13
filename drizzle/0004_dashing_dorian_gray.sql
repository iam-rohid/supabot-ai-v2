ALTER TABLE "projects" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "welcome_message" varchar(300);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "theme" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "custom_css" text;