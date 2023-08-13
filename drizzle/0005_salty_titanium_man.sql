CREATE TABLE IF NOT EXISTS "quick_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(80) NOT NULL,
	"prompt" varchar(500) NOT NULL,
	"project_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_prompts_title_index" ON "quick_prompts" ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_prompts_created_at_index" ON "quick_prompts" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quick_prompts_updated_at_index" ON "quick_prompts" ("updated_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quick_prompts" ADD CONSTRAINT "quick_prompts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
