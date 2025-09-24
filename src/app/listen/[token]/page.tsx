import { api } from "~/trpc/server";
import ListenOnlyAudioPlayer from "~/app/_components/listen/ListenOnlyAudioPlayer";
import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { VisibilityBanner } from "~/app/_components/listen/VisibilityBanner";

interface ListenPageProps {
  params: Promise<{ token: string }>;
}


export default async function ListenPage({ params }: ListenPageProps) {
  const { token } = await params;
  const session = await auth();

  try {
    const audio = await api.audio.getAudioByToken({ token });
    void api.marker.getMarkers.prefetch({ audioId: audio.id });

    // Check if the audio is deleted
    if (audio.deletedAt) {
      notFound();
    }

    // Check if user has access
    const isCreator = session?.user?.id === audio.createdById;
    if (!audio.isPublic && !isCreator) {
      notFound();
    }

    return (
      <div className="w-full flex flex-col items-center mx-auto px-4 py-8">
        <VisibilityBanner isPublic={audio.isPublic} isCreator={isCreator} />
        <ListenOnlyAudioPlayer
          audioUrl={audio.filePath}
          audioName={audio.name}
          audioReadOnlyToken={audio.readonlyToken}
          audioId={audio.id}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching audio by token:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: ListenPageProps) {
  try {
    const { token } = await params;
    const audio = await api.audio.getAudioByToken({ token });
    return {
      title: `${audio.name} - Audio Player`,
      description: `Listen to ${audio.name}`,
    };
  } catch {
    return {
      title: "Audio Player",
      description: "Listen to audio files",
    };
  }
}