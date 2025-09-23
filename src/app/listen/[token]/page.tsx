import { api } from "~/trpc/server";
import ListenOnlyAudioPlayer from "~/app/_components/listen/ListenOnlyAudioPlayer";
import { notFound } from "next/navigation";

interface ListenPageProps {
  params: { token: string };
}


export default async function ListenPage({ params }: ListenPageProps) {
  const { token } = await params;
  try {
    const audio = await api.audio.getAudioByToken({ token });

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ListenOnlyAudioPlayer
            audioUrl={audio.filePath}
            audioName={audio.name}
            audioReadOnlyToken={audio.readonlyToken}
            audioId={audio.id}
          />
        </div>
      </div>
    );
  } catch (error) {
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