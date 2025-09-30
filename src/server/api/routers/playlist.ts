import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const playlistRouter = createTRPCRouter({
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const playlists = await ctx.db.playlist.findMany({
      where: {
        createdById: ctx.session.user.id,
        deletedAt: null
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            audios: true,
          },
        },
      },
    });

    // Transform the result to include audioCount at the top level
    const playlistsWithAudioCount = playlists.map(playlist => ({
      ...playlist,
      audioCount: playlist._count.audios,
      _count: undefined,
    }));

    return playlistsWithAudioCount;
  }),

  getUserPlaylistById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          audios: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              addedAt: true,
              audio: {
                select: {
                  id: true,
                  name: true,
                  originalFileName: true,
                  filePath: true,
                  createdAt: true,
                  _count: {
                    select: {
                      markers: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // Transform the result to include markerCount at the audio level
      const playlistWithMarkerCount = {
        ...playlist,
        audios: playlist.audios.map(playlistAudio => ({
          ...playlistAudio,
          audio: {
            ...playlistAudio.audio,
            markerCount: playlistAudio.audio._count.markers,
            _count: undefined,
          },
        })),
      };

      return playlistWithMarkerCount;
    }),

  getPublicPlaylistById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: {
          id: input.id,
          isPublic: true,
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          audios: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              addedAt: true,
              audio: {
                select: {
                  id: true,
                  name: true,
                  isPublic: true,
                  originalFileName: true,
                  filePath: true,
                  createdAt: true,
                  _count: {
                    select: {
                      markers: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // Transform the result to include markerCount at the audio level
      const playlistWithMarkerCount = {
        ...playlist,
        audios: playlist.audios
          .filter(playlistAudio => playlistAudio.audio.isPublic)
          .map(playlistAudio => ({
            ...playlistAudio,
            audio: {
              ...playlistAudio.audio,
              markerCount: playlistAudio.audio._count.markers,
              _count: undefined,
            },
          })),
      };

      return playlistWithMarkerCount;
    }),

  createPlaylist: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required").max(100, "Name is too long"),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.create({
        data: {
          name: input.name,
          isPublic: input.isPublic,
          createdById: ctx.session.user.id,
        },
        select: {
          id: true,
          name: true,
          isPublic: true,
          createdAt: true,
        },
      });

      return playlist;
    }),

  updatePlaylist: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Name is required").max(100, "Name is too long"),
      isPublic: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const updatedPlaylist = await ctx.db.playlist.update({
        where: { id: input.id },
        data: {
          name: input.name,
          isPublic: input.isPublic,
        },
        select: {
          id: true,
          name: true,
          isPublic: true,
          updatedAt: true,
        },
      });

      return updatedPlaylist;
    }),

  deletePlaylist: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Perform soft delete by setting deletedAt timestamp
      await ctx.db.playlist.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  addAudioToPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      audioId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if playlist exists and belongs to user
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Check if audio exists and belongs to user
      const audio = await ctx.db.audio.findUnique({
        where: { id: input.audioId },
        select: { createdById: true, deletedAt: true },
      });

      if (!audio || audio.deletedAt) {
        throw new Error("Audio not found");
      }

      if (audio.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Check if audio is already in playlist
      const existingPlaylistAudio = await ctx.db.playlistAudio.findUnique({
        where: {
          playlistId_audioId: {
            playlistId: input.playlistId,
            audioId: input.audioId,
          },
        },
      });

      if (existingPlaylistAudio) {
        throw new Error("Audio is already in this playlist");
      }

      // Get the next order number
      const lastPlaylistAudio = await ctx.db.playlistAudio.findFirst({
        where: { playlistId: input.playlistId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const nextOrder = (lastPlaylistAudio?.order ?? -1) + 1;

      // Add audio to playlist
      const playlistAudio = await ctx.db.playlistAudio.create({
        data: {
          playlistId: input.playlistId,
          audioId: input.audioId,
          order: nextOrder,
        },
        select: {
          id: true,
          order: true,
          addedAt: true,
          audio: {
            select: {
              id: true,
              name: true,
              originalFileName: true,
              filePath: true,
            },
          },
        },
      });

      return playlistAudio;
    }),

  removeAudioFromPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      audioId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if playlist exists and belongs to user
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Remove audio from playlist
      await ctx.db.playlistAudio.delete({
        where: {
          playlistId_audioId: {
            playlistId: input.playlistId,
            audioId: input.audioId,
          },
        },
      });

      return { success: true };
    }),

  reorderPlaylistAudios: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      audioOrders: z.array(z.object({
        audioId: z.string(),
        order: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if playlist exists and belongs to user
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Update the order of each audio in the playlist
      await Promise.all(
        input.audioOrders.map(({ audioId, order }) =>
          ctx.db.playlistAudio.update({
            where: {
              playlistId_audioId: {
                playlistId: input.playlistId,
                audioId: audioId,
              },
            },
            data: { order },
          })
        )
      );

      return { success: true };
    }),

  getAvailableAudiosForPlaylist: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if playlist exists and belongs to user
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Get all user's audios that are not in this playlist
      const availableAudios = await ctx.db.audio.findMany({
        where: {
          createdById: ctx.session.user.id,
          deletedAt: null,
          playlistAudios: {
            none: {
              playlistId: input.playlistId,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          createdAt: true,
          _count: {
            select: {
              markers: true,
            },
          },
        },
      });

      // Transform the result to include markerCount at the top level
      const audiosWithMarkerCount = availableAudios.map(audio => ({
        ...audio,
        markerCount: audio._count.markers,
        _count: undefined,
      }));

      return audiosWithMarkerCount;
    }),

  getUserPlaylistsForAudio: protectedProcedure
    .input(z.object({ audioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlists = await ctx.db.playlist.findMany({
        where: {
          createdById: ctx.session.user.id,
          deletedAt: null
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              audios: true,
            },
          },
          audios: {
            where: {
              audioId: input.audioId,
            },
            select: {
              audioId: true,
            },
          },
        },
      });

      // Transform the result to include audioCount and hasAudio at the top level
      const playlistsWithAudioInfo = playlists.map(playlist => ({
        ...playlist,
        audioCount: playlist._count.audios,
        hasAudio: playlist.audios.length > 0,
        _count: undefined,
        audios: undefined,
      }));

      return playlistsWithAudioInfo;
    }),

  getUserAudiosForPlaylist: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if playlist exists and belongs to user
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.playlistId },
        select: { createdById: true, deletedAt: true },
      });

      if (!playlist || playlist.deletedAt) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Get all user's audios with information about whether they're in this playlist
      const allAudios = await ctx.db.audio.findMany({
        where: {
          createdById: ctx.session.user.id,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          originalFileName: true,
          filePath: true,
          createdAt: true,
          _count: {
            select: {
              markers: true,
            },
          },
          playlistAudios: {
            where: {
              playlistId: input.playlistId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      // Transform the result to include markerCount and isInPlaylist at the top level
      const audiosWithPlaylistInfo = allAudios.map(audio => ({
        ...audio,
        markerCount: audio._count.markers,
        isInPlaylist: audio.playlistAudios.length > 0,
        _count: undefined,
        playlistAudios: undefined,
      }));

      return audiosWithPlaylistInfo;
    }),
});