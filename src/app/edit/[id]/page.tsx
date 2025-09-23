import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { EditAudioForm } from "~/app/_components/main/EditAudioForm";
import { HydrateClient } from "~/trpc/server";
import { Suspense } from "react";

interface EditAudioPageProps {
  params: {
    id: string;
  };
}

export default async function EditAudioPage({ params }: EditAudioPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Prefetch the audio data
  try {
    await api.audio.getAudioById.prefetch({ id: params.id });
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
          <EditAudioForm audioId={params.id} />
        </Suspense>
      </HydrateClient>
    </main>
  );
}