import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { ListenPlaylistView } from "~/app/_components/playlist/listen/ListenPlaylistView";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { VisibilityBanner } from "~/app/_components/global/VisibilityBanner";
import { env } from "~/env";

interface ListenPlaylistPageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

export default async function ListenPlaylistPage({ params }: ListenPlaylistPageProps) {
  const { playlistId } = await params;
  const session = await auth();

  // If authentication is required for public content and user is not logged in, redirect to not found
  if (env.REQUIRE_AUTH_FOR_PUBLIC_CONTENT && !session) {
    notFound();
  }

  try {
    const playlist = session ?
      await api.playlist.getUserPlaylistById({ id: playlistId }) :
      await api.playlist.getPublicPlaylistById({ id: playlistId });

      // Check if user has access
      const isCreator = session?.user?.id === playlist.createdBy.id;
      if (!(playlist.isPublic || isCreator)) {
        notFound();
      }
      
    return (
      <HydrateClient>
        <VisibilityBanner isPublic={playlist.isPublic} isCreator={isCreator} />
        <ListenPlaylistView playlist={playlist} />
      </HydrateClient>
    );
  } catch {
    notFound();
  }

}

export async function generateMetadata({ params }: ListenPlaylistPageProps) {
  const { playlistId } = await params;
  const session = await auth();
  try {
    const playlist = session ?
      await api.playlist.getUserPlaylistById({ id: playlistId }) :
      await api.playlist.getPublicPlaylistById({ id: playlistId });
    return {
      title: `${playlist.name} - Playlist`,
      description: `Listen to ${playlist.name}`,
    };
  } catch {
    return {
      title: "Playlist",
      description: "Listen to playlists",
    };
  }
}