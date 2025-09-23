import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const audioRouter = createTRPCRouter({
  getUserAudios: protectedProcedure.query(async ({ ctx }) => {
    const audios = await ctx.db.audio.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        originalFileName: true,
        filePath: true,
        readonlyToken: true,
        createdAt: true,
      },
    });

    return audios;
  }),

  getAudioById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const audio = await ctx.db.audio.findUnique({
        where: {
          id: input.id,
          createdById: ctx.session.user.id
        },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          readonlyToken: true,
          createdAt: true,
        },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      return audio;
    }),

  getAudioByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const audio = await ctx.db.audio.findFirst({
        where: {
          readonlyToken: input.token
        },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          readonlyToken: true,
          createdAt: true,
        },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      return audio;
    }),

  deleteAudio: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First check if the audio belongs to the user
      const audio = await ctx.db.audio.findUnique({
        where: { id: input.id },
        select: { createdById: true, filePath: true },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      if (audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Delete the database record
      await ctx.db.audio.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});