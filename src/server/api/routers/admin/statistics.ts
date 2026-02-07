import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { requireAdmin } from "./utils";
import { readdir, stat } from "fs/promises";
import path from "path";

export const statisticsRouter = createTRPCRouter({
  getOverallStatistics: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.session);

    // Get counts in parallel
    const [
      totalUsers,
      totalAudios,
      totalPlaylists,
      totalListens,
      totalPlaylistListens,
      activeAudios,
      activePlaylists,
      deletedAudios,
      deletedPlaylists,
      publicAudios,
      publicPlaylists,
      recentListens,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.audio.count(),
      ctx.db.playlist.count(),
      ctx.db.audioListenRecord.count(),
      ctx.db.playlistListenRecord.count(),
      ctx.db.audio.count({ where: { deletedAt: null } }),
      ctx.db.playlist.count({ where: { deletedAt: null } }),
      ctx.db.audio.count({ where: { deletedAt: { not: null } } }),
      ctx.db.playlist.count({ where: { deletedAt: { not: null } } }),
      ctx.db.audio.count({ where: { deletedAt: null, isPublic: true } }),
      ctx.db.playlist.count({ where: { deletedAt: null, isPublic: true } }),
      // Recent listens in last 7 days
      ctx.db.audioListenRecord.count({
        where: {
          listenedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get top listened audios
    const topAudios = await ctx.db.audio.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        _count: {
          select: { listenRecords: true },
        },
      },
      orderBy: {
        listenRecords: { _count: "desc" },
      },
      take: 5,
    });

    // Get storage stats
    let storageStats = { totalFiles: 0, totalSizeBytes: 0 };
    try {
      const uploadsDir = path.join(process.cwd(), "data", "uploads");
      const files = await readdir(uploadsDir);
      let totalSize = 0;
      for (const file of files) {
        try {
          const fileStat = await stat(path.join(uploadsDir, file));
          if (fileStat.isFile()) {
            totalSize += fileStat.size;
          }
        } catch {
          // Skip files that can't be stat'd
        }
      }
      storageStats = { totalFiles: files.length, totalSizeBytes: totalSize };
    } catch {
      // Directory doesn't exist or can't be read
    }

    return {
      users: {
        total: totalUsers,
      },
      audios: {
        total: totalAudios,
        active: activeAudios,
        deleted: deletedAudios,
        public: publicAudios,
      },
      playlists: {
        total: totalPlaylists,
        active: activePlaylists,
        deleted: deletedPlaylists,
        public: publicPlaylists,
      },
      listens: {
        totalAudioListens: totalListens,
        totalPlaylistListens: totalPlaylistListens,
        recentAudioListens: recentListens,
      },
      topAudios: topAudios.map((audio) => ({
        id: audio.id,
        name: audio.name,
        listens: audio._count.listenRecords,
      })),
      storage: storageStats,
    };
  }),

  getUnusedAudios: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.session);

    // Get audios with 0 listens that are not deleted
    const unusedAudios = await ctx.db.audio.findMany({
      where: {
        deletedAt: null,
        listenRecords: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        originalFileName: true,
        createdAt: true,
        isPublic: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return unusedAudios;
  }),

  softDeleteAudio: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.session);

      const audio = await ctx.db.audio.findUnique({
        where: { id: input.id },
        select: { id: true, deletedAt: true },
      });

      if (!audio) {
        throw new Error("Audio not found");
      }

      if (audio.deletedAt) {
        throw new Error("Audio is already deleted");
      }

      await ctx.db.audio.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true, id: input.id };
    }),
});
