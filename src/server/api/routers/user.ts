import { updateUserSchema } from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(({ ctx, input }) =>
      ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(typeof input.name !== "undefined" ? { name: input.name } : {}),
          ...(typeof input.email !== "undefined" ? { email: input.email } : {}),
          ...(typeof input.image !== "undefined" ? { image: input.image } : {}),
        },
      })
    ),
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const ownedProjects = await ctx.prisma.projectUser.findMany({
      where: { role: "OWNER", userId: ctx.session.user.id },
    });
    if (ownedProjects.length > 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must transfer ownership of your projects or delete them before you can delete your account.",
      });
    }
    return ctx.prisma.user.delete({ where: { id: ctx.session.user.id } });
  }),
});
