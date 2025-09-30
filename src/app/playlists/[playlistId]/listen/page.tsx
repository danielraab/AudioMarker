import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { ListenPlaylistView } from "~/app/_components/playlist/listen/ListenPlaylistView";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "~/server/auth";

interface ListenPlaylistPageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

export default async function ListenPlaylistPage({ params }: ListenPlaylistPageProps) {
  const { playlistId } = await params;
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  try {
    void api.playlist.getPublicPlaylistById.prefetch({ id: playlistId });
  } catch {
    notFound();
  }

  return (
    <HydrateClient>
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <p className="text-default-500">Loading playlist details...</p>
        </div>
      }>
        <ListenPlaylistView playlistId={playlistId}/>
      </Suspense>
    </HydrateClient>
  );
}