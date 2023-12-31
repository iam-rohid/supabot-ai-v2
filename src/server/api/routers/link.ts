import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, desc, eq } from "drizzle-orm";
import { linksTable } from "@/lib/schema/links";
import { requireProjectUser, requireProjectUserBySlug } from "./common";
import GetSitemapLinks from "get-sitemap-links";
import { Client } from "@upstash/qstash";
import { TRPCError } from "@trpc/server";
import { ALLOWED_EMAILS } from "@/utils/constants";

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
        ctx,
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
      const user = await requireProjectUserBySlug(ctx, input.projectSlug);

      // Simple Rate Lmiting
      if (!ALLOWED_EMAILS.includes(ctx.session.user.email!)) {
        const existingLinks = await ctx.db
          .select({})
          .from(linksTable)
          .where(eq(linksTable.projectId, user.projectId));
        if (existingLinks.length + input.data.urls.length > 2) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You can not add more than 2 links in a project as of now.",
          });
        }
      }

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
            body: {
              type: "train",
              linkId: link.id,
            },
            topic: "new-link-added",
          })
        )
      );
      return links;
    }),
  retrain: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [link] = await ctx.db
        .select()
        .from(linksTable)
        .where(and(eq(linksTable.id, input.linkId)))
        .limit(1);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found!" });
      }
      // Make sure user have access to the project
      await requireProjectUser(ctx, link.projectId);

      if (!["trained", "failed"].includes(link.trainingStatus)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Link is already in queue or training",
        });
      }
      return c.publishJSON({
        body: {
          type: "retrain",
          linkId: input.linkId,
        },
        topic: "new-link-added",
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [link] = await ctx.db
        .select()
        .from(linksTable)
        .where(and(eq(linksTable.id, input.linkId)))
        .limit(1);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found!" });
      }
      // Make sure user have access to the project
      await requireProjectUser(ctx, link.projectId);
      if (!["trained", "failed"].includes(link.trainingStatus)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Link is in queue or training",
        });
      }
      return ctx.db
        .delete(linksTable)
        .where(eq(linksTable.id, input.linkId))
        .returning();
    }),
});
