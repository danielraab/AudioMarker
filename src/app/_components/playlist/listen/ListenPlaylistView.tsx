'use client';

import { ListenPlaylistAudioItem } from "./ListenPlaylistAudioItem";
import { Card, CardBody, Chip } from "@heroui/react";
import { Globe, User, ListMusic } from "lucide-react";
import { formatTimeAgo } from "~/lib/time";
import { notFound } from "next/navigation";
import type { PlaylistWithAudios } from "~/types/Playlist";
import { api } from "~/trpc/react";
import { useIncrementListenCount } from "~/lib/hooks/useIncrementListenCount";
import { useTranslations } from "next-intl";

interface ListenPlaylistViewProps {
  playlist: PlaylistWithAudios;
}

export function ListenPlaylistView({ playlist }: ListenPlaylistViewProps) {
  // Mutation to increment listen count
  const incrementListenCount = api.playlist.incrementListenCount.useMutation();

  // Increment listen count (only once per 2 hours per browser/tab)
  useIncrementListenCount({
    id: playlist.id,
    type: 'playlist',
    incrementMutation: incrementListenCount,
  });

  const t = useTranslations('ListenPlaylistView');
  const tPlaylist = useTranslations('PlaylistListItem');

  try {

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Playlist Header */}
        <Card className="shadow-sm">
          <CardBody className="gap-4">
            <div className="flex flex-row justify-between items-start gap-4">
              <div className="grow">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{playlist.name}</h1>
                  <div title={t('visibility.publicPlaylist')}>
                    <Globe size={20} className="text-success" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <Chip size="sm" variant="flat" color="secondary">
                    {tPlaylist('audioCount', { count: playlist.audios.length })}
                  </Chip>
                </div>
                <div className="space-y-1 text-sm text-default-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span className="font-medium">{t('labels.createdBy')}</span>
                    <span>{playlist.createdBy.name ?? playlist.createdBy.email ?? t('labels.anonymous')}</span>
                  </div>
                  <p><span className="font-medium">{tPlaylist('labels.created')}</span> {formatTimeAgo(new Date(playlist.createdAt))}</p>
                  <p><span className="font-medium">{tPlaylist('labels.lastUpdated')}</span> {formatTimeAgo(new Date(playlist.updatedAt))}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Audio List */}
        <section className="rounded-lg border border-default-200 bg-background p-3 sm:p-6">
          <header className="mb-4">
            <div className="flex flex-col">
              <p className="text-md font-semibold"><ListMusic className="inline mr-2" size={16} />{t('section.title')}</p>
              <p className="text-small text-default-500">{t('section.description')}</p>
            </div>
          </header>

          {playlist.audios.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-default-500">{t('empty.noPublicAudios')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {playlist.audios.map((playlistAudio) => (
                <ListenPlaylistAudioItem
                  key={playlistAudio.id}
                  playlistAudio={playlistAudio}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}