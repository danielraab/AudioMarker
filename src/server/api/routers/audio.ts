import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const audioRouter = createTRPCRouter({
  getUserAudios: protectedProcedure.query(async ({ ctx }) => {
    const audios = await ctx.db.audio.findMany({
      where: { 
        createdById: ctx.session.user.id,
        deletedAt: null // Only fetch non-deleted audios
      },
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
          updatedAt: true,
          isPublic: true,
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
          readonlyToken: input.token,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          readonlyToken: true,
          createdAt: true,
          isPublic: true,
          deletedAt: true,
          createdById: true,
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
      // First check if the audio belongs to the user and is not already deleted
      const audio = await ctx.db.audio.findUnique({
        where: { id: input.id },
        select: { createdById: true, filePath: true, deletedAt: true },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      if (audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      if (audio.deletedAt) {
        throw new Error("Audio already deleted");
      }

      // Perform soft delete by setting deletedAt timestamp

  }),
  
  updateAudio: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().min(1, "Name is required").max(100, "Name is too long"),
      isPublic: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const audio = await ctx.db.audio.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      if (audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const updatedAudio = await ctx.db.audio.update({
        where: { id: input.id },
        data: { 
          name: input.name,
          isPublic: input.isPublic,
        },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          readonlyToken: true,
          createdAt: true,
        },
      });

      return updatedAudio;
      await ctx.db.audio.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});