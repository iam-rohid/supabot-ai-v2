import { updateUserSchema } from "@/lib/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            ...(typeof input.name !== "undefined" ? { name: input.name } : {}),
            ...(typeof input.email !== "undefined"
              ? { email: input.email }
              : {}),
            ...(typeof input.image !== "undefined"
              ? { image: input.image }
              : {}),
          },
        });
        return user;
      } catch (err) {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already in use",
          });
        }
        throw err;
      }
    }),
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
