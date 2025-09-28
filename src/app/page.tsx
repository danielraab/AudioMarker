import CreateAudioForm from "~/app/_components/main/CreateAudioForm";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import PublicLandingPage from "../components/publicLandingPage";
import AudioFilesList from "~/components/AudioFilesList";
import { CreatePlaylistForm } from "./_components/playlist/CreatePlaylistForm";
import PlaylistsList from "~/components/PlaylistsList";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      {session?.user && <>
        <div className="flex flex-col justify-center gap-2">
          <CreateAudioForm />
          <AudioFilesList />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <CreatePlaylistForm/>
          <PlaylistsList />
        </div>
      </>}
      {!session?.user && <PublicLandingPage />}
    </HydrateClient>
  );
}
