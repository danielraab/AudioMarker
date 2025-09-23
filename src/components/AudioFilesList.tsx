import { auth } from "~/server/auth";
import { AudioListItem } from "~/app/_components/main/AudioListItem";
import { api } from "~/trpc/server";

export default async function AudioFilesList() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const audios = await api.audio.getUserAudios();

  if (!audios || audios.length === 0) {
    return (
      <section className="max-w-4xl mx-auto rounded-lg border border-default-200 bg-background p-6">
        <header className="mb-4">
          <div className="flex flex-col">
            <p className="text-md font-semibold">Your Audio Files</p>
            <p className="text-small text-default-500">Manage your uploaded audio files</p>
          </div>
        </header>
        <div className="flex items-center justify-center py-8">
          <p className="text-default-500">No audio files uploaded yet. Upload your first audio file above!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto rounded-lg border border-default-200 bg-background p-6">
      <header className="mb-4">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Your Audio Files</p>
          <p className="text-small text-default-500">Manage your uploaded audio files ({audios.length})</p>
        </div>
      </header>
      <div className="space-y-4">
        {audios.map((audio) => (
          <AudioListItem
            key={audio.id}
            audio={audio}
          />
        ))}
      </div>
    </section>
  );
}