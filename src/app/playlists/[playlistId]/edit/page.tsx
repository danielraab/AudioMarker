import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { PlaylistEditContainer } from "~/app/_components/playlist/edit/PlaylistEditContainer";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EditPlaylistForm from "~/app/_components/playlist/edit/EditPlaylistForm";
import PageHeader from "~/app/_components/PageHeader";

interface PlaylistEditPageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

export default async function PlaylistEditPage({ params }: PlaylistEditPageProps) {
  const { playlistId } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  try {
    void api.playlist.getPlaylistById.prefetch({ id: playlistId });
  } catch (error) {
    console.error("Error prefetching playlist data:", error);
    notFound();
  }

  return (
    <HydrateClient>
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <p className="text-default-500">Loading playlist details...</p>
        </div>
      }>
        <PageHeader backHref="/" title="Edit Playlist" />
        <EditPlaylistForm playlistId={playlistId} />
        <PlaylistEditContainer playlistId={playlistId} />
      </Suspense>
    </HydrateClient>
  );
}