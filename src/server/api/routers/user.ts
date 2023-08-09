import { projectUsersTable } from "@/lib/schema/project-users";
import { usersTable } from "@/lib/schema/users";
import { updateUserSchema } from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .update(usersTable)
        .set({
          ...(typeof input.name !== "undefined" ? { name: input.name } : {}),
          ...(typeof input.email !== "undefined" ? { email: input.email } : {}),
          ...(typeof input.image !== "undefined" ? { image: input.image } : {}),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, ctx.session.user.id))
        .returning();
      if (!user) {
        throw "Failed to update user";
      }
      return user;
    }),
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const ownedProjects = await ctx.db
      .select()
      .from(projectUsersTable)
      .where(
        and(
          eq(projectUsersTable.userId, ctx.session.user.id),
          eq(projectUsersTable.role, "owner")
        )
      );
    if (ownedProjects.length > 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must transfer ownership of your projects or delete them before you can delete your account.",
      });
    }
    return await ctx.db
      .delete(usersTable)
      .where(eq(usersTable.id, ctx.session.user.id))
      .returning();
  }),
});
