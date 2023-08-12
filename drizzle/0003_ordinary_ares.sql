ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_link_id_links_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
