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
        createdAt: true,
        isPublic: true,
        listenCounter: true,
        lastListenAt: true,
        _count: {
          select: {
            markers: true,
          },
        },
      },
    });

    // Transform the result to include markerCount at the top level
    const audiosWithMarkerCount = audios.map(audio => ({
      ...audio,
      markerCount: audio._count.markers,
      _count: undefined, // Remove the _count object
    }));

    return audiosWithMarkerCount;
  }),

  getUserAudioById: protectedProcedure
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
          createdAt: true,
          updatedAt: true,
          isPublic: true,
          createdById: true,
        },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      return audio;
    }),

  getPublicAudioById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const audio = await ctx.db.audio.findFirst({
        where: {
          id: input.id,
          isPublic: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          createdAt: true,
          isPublic: true,
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
      await ctx.db.audio.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
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
          createdAt: true,
        },
      });

      return updatedAudio;
    }),

  uploadAudio: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required").max(100, "Name is too long"),
      fileName: z.string(),
      fileData: z.string(), // base64 encoded file data
      fileSize: z.number().max(50 * 1024 * 1024, "File size must be less than 50MB"), // 50MB limit
    }))
    .mutation(async ({ ctx, input }) => {
      const { writeFile } = await import('fs/promises');
      const { v4: uuidv4 } = await import('uuid');
      const path = await import('path');

      // Validate file extension
      const fileExtension = path.extname(input.fileName).toLowerCase();
      if (fileExtension !== '.mp3') {
        throw new Error('Only .mp3 files are allowed');
      }

      // Generate unique ID
      const id = uuidv4();
      const outFileName = `${id}${fileExtension}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', outFileName);

      try {
        // Convert base64 to buffer and save
        const buffer = Buffer.from(input.fileData, 'base64');
        await writeFile(filePath, buffer);

        // Create database record
        const audio = await ctx.db.audio.create({
          data: {
            id,
            name: input.name,
            originalFileName: input.fileName,
            filePath: `/uploads/${outFileName}`,
            createdById: ctx.session.user.id,
          },
        });

        return {
          id: audio.id
        };
      } catch (error) {
        console.error('File upload error:', error);
        throw new Error('Upload failed');
      }
    }),

  incrementListenCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const audio = await ctx.db.audio.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          isPublic: true,
          deletedAt: true,
          createdById: true
        },
      });

      if (!audio || audio.deletedAt) {
        throw new Error("Audio not found");
      }

      // Check if user has access (public or owner)
      const hasAccess = audio.isPublic || (ctx.session?.user?.id === audio.createdById);
      if (!hasAccess) {
        throw new Error("Unauthorized");
      }

      // Increment the listen counter
      await ctx.db.audio.update({
        where: { id: input.id },
        data: {
          listenCounter: { increment: 1 },
          lastListenAt: new Date(),
        },
      });

      return { success: true };
    }),
});