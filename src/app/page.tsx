import AudioUploadForm from "~/components/AudioUploadForm";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import PublicLandingPage from "./_components/publicLandingPage";
import Demo from "./_components/demo";
import AudioFilesList from "~/components/AudioFilesList";

export default async function Home() {
  const session = await auth();


  return (
    <HydrateClient>
      {session?.user && <>
        <AudioUploadForm />
        <AudioFilesList />
        <Demo />
      </>}
      {!session?.user && <PublicLandingPage />}
    </HydrateClient>
  );
}
