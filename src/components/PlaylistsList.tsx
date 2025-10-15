import { auth } from "~/server/auth";
import { PlaylistListItem } from "~/app/_components/playlist/PlaylistListItem";
import { api } from "~/trpc/server";
import { ListMusic } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PlaylistsList() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const t = await getTranslations("PlaylistsList");
  const playlists = await api.playlist.getUserPlaylists();
  const playlistCount = playlists?.length ?? 0;

  return (
    <section className="sm:min-w-md max-w-4xl mx-auto rounded-lg border border-default-200 bg-background p-3 sm:p-6">
      <header className="mb-4">
        <div className="flex flex-col">
          <p className="text-md font-semibold"><ListMusic className="inline" size={16} /> {t("title")}</p>
          <p className="text-small text-default-500">{t("description", { playlistCount })}</p>
        </div>
      </header>
      {(!playlists || playlists.length === 0) && (
        <div className="flex items-center justify-center py-8">
          <p className="text-default-500">{t("empty")}</p>
        </div>
      )}
      {playlistCount > 0 && (
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <PlaylistListItem
              key={playlist.id}
              playlist={playlist}
            />
          ))}
        </div>
      )}
    </section>
  );
}