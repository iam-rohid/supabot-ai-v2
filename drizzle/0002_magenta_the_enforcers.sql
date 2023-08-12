ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_link_id_links_id_fk";
--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "link_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN IF EXISTS "updated_at";