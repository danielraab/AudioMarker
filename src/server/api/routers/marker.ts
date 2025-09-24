import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const markerRouter = createTRPCRouter({
  getMarkers: protectedProcedure
    .input(z.object({ audioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const markers = await ctx.db.marker.findMany({
        where: {
          audioId: input.audioId,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
      return markers;
    }),

  createMarker: protectedProcedure
    .input(z.object({
      audioId: z.string(),
      label: z.string().min(1),
      timestamp: z.number().min(0),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First verify the user owns the audio
      const audio = await ctx.db.audio.findUnique({
        where: {
          id: input.audioId,
        },
        select: {
          createdById: true,
        },
      });

      if (!audio || audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const marker = await ctx.db.marker.create({
        data: {
          audioId: input.audioId,
          label: input.label,
          timestamp: input.timestamp,
          color: input.color,
        },
      });
      return marker;
    }),

  deleteMarker: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First verify the user owns the associated audio
      const marker = await ctx.db.marker.findUnique({
        where: {
          id: input.id,
        },
        include: {
          audio: {
            select: {
              createdById: true,
            },
          },
        },
      });

      if (!marker || marker.audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db.marker.delete({
        where: {
          id: input.id,
        },
      });
      return { success: true };
    }),
});