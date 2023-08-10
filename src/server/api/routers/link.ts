import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";
import { linksTable } from "@/lib/schema/links";
import { requireProjectUserBySlug } from "./common";
import GetSitemapLinks from "get-sitemap-links";
import { Client } from "@upstash/qstash";

const c = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const linkRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const projectUser = await requireProjectUserBySlug(
        ctx.db,
        ctx.session.user.id,
        input.projectSlug
      );
      return ctx.db
        .select()
        .from(linksTable)
        .where(eq(linksTable.projectId, projectUser.projectId))
        .orderBy(desc(linksTable.lastTrainedAt), desc(linksTable.updatedAt));
    }),
  fetchUrlsFromSitemap: protectedProcedure
    .input(
      z.object({
        sitemapUrl: z.string().url(),
      })
    )
    .output(z.array(z.string().url()))
    .mutation(async ({ input }) => {
      const links = await GetSitemapLinks(input.sitemapUrl);
      return links;
    }),
  addLinks: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        data: z.object({
          urls: z.array(z.string().url()).min(1),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await requireProjectUserBySlug(
        ctx.db,
        ctx.session.user.id,
        input.projectSlug
      );
      const links = await ctx.db
        .insert(linksTable)
        .values(
          input.data.urls.map((url) => ({ url, projectId: user.projectId }))
        )
        .onConflictDoNothing()
        .returning();

      await Promise.allSettled(
        links.map((link) =>
          c.publishJSON({
            body: link,
            topic: "new-link-added",
          })
        )
      );
      return links;
    }),
});
