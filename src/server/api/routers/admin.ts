import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.session.user.isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    // Fetch all users with their account information
    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        image: true,
        _count: {
          select: {
            audios: true,
            playlists: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        email: "asc",
      },
    });

    return users;
  }),
});