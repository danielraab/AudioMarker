import { api } from "~/trpc/server";
import ListenOnlyAudioPlayer from "~/app/_components/audio/listen/ListenOnlyAudioPlayer";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { VisibilityBanner } from "~/app/_components/global/VisibilityBanner";
import { env } from "~/env";

interface ListenPageProps {
  params: Promise<{ audioId: string }>;
}


export default async function ListenPage({ params }: ListenPageProps) {
  const { audioId } = await params;
  const session = await auth();

  // If authentication is required for public content and user is not logged in, redirect to not found
  if (env.REQUIRE_AUTH_FOR_PUBLIC_CONTENT && !session) {
    notFound();
  }

  try {
    const audio = session ?
      await api.audio.getUserAudioById({ id: audioId }) :
      await api.audio.getPublicAudioById({ id: audioId });
    void api.marker.getMarkers.prefetch({ audioId: audio.id });

    // Check if user has access
    const isCreator = session?.user?.id === audio.createdById;
    if (!(audio.isPublic || isCreator)) {
      notFound();
    }

    return (
      <div className="w-full flex flex-col items-center mx-auto py-8">
        <VisibilityBanner isPublic={audio.isPublic} isCreator={isCreator} />
        <ListenOnlyAudioPlayer
          audioUrl={audio.filePath}
          audioName={audio.name}
          audioReadOnlyToken={audio.id}
          audioId={audio.id}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching audio by id:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: ListenPageProps) {
  const { audioId } = await params;
  const session = await auth();
  try {
    const audio = session ?
      await api.audio.getUserAudioById({ id: audioId }) :
      await api.audio.getPublicAudioById({ id: audioId });
    return {
      title: `${audio.name} - Audio Marker`,
      description: `Listen to ${audio.name}`,
    };
  } catch {
    return {
      title: "Audio Marker - Listen",
      description: "Listen to audio files",
    };
  }
}