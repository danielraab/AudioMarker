import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { EditAudioForm } from "~/app/_components/edit/EditAudioForm";
import { HydrateClient } from "~/trpc/server";
import { Suspense } from "react";

interface EditAudioPageProps {
  params: {
    audioId: string;
  };
}

export default async function EditAudioPage({ params }: EditAudioPageProps) {
  const {audioId} = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Prefetch the audio data
  try {
    void api.audio.getAudioById.prefetch({ id: audioId });
  } catch (error) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-4">
      <HydrateClient>
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <p className="text-default-500">Loading audio details...</p>
          </div>
        }>
          <EditAudioForm audioId={audioId} />
        </Suspense>
      </HydrateClient>
    </main>
  );
}