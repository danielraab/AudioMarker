'use client';

import { ListenPlaylistAudioItem } from "./ListenPlaylistAudioItem";
import { Card, CardBody, Chip, Button, Progress } from "@heroui/react";
import { Globe, User, ListMusic, PlayCircle, Download, CheckCircle, WifiOff } from "lucide-react";
import { formatTimeAgo } from "~/lib/time";
import { notFound, useRouter } from "next/navigation";
import type { PlaylistWithAudios } from "~/types/Playlist";
import { api } from "~/trpc/react";
import { useIncrementListenCount } from "~/lib/hooks/useIncrementListenCount";
import { useOfflinePlaylistCache, useNetworkStatus } from "~/lib/hooks/useOfflineCache";
import { useTranslations } from "next-intl";

interface ListenPlaylistViewProps {
  playlist: PlaylistWithAudios;
}

export function ListenPlaylistView({ playlist }: ListenPlaylistViewProps) {
  const router = useRouter();
  
  // Mutation to increment listen count
  const incrementListenCount = api.playlist.incrementListenCount.useMutation();

  // Increment listen count (only once per 2 hours per browser/tab)
  useIncrementListenCount({
    id: playlist.id,
    type: 'playlist',
    incrementMutation: incrementListenCount,
  });

  // Network status and offline caching
  const { isOffline } = useNetworkStatus();
  const { 
    isAvailableOffline, 
    isCaching, 
    cachingProgress, 
    cachePlaylistForOffline 
  } = useOfflinePlaylistCache(playlist);

  const t = useTranslations('ListenPlaylistView');
  const tPlaylist = useTranslations('PlaylistListItem');

  const handleStartAutoplay = () => {
    if (playlist.audios.length === 0) return;
    
    const firstAudio = playlist.audios[0];
    if (!firstAudio) return;
    
    router.push(`/audios/${firstAudio.audio.id}/listen?playlistId=${playlist.id}&autoplay=true`);
  };

  try {

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Offline Indicator */}
        {isOffline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
            <WifiOff size={16} />
            <span>You&apos;re offline. Playing from cached content.</span>
          </div>
        )}

        {/* Playlist Header */}
        <Card className="shadow-sm">
          <CardBody className="gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="grow">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{playlist.name}</h1>
                  <Chip size="sm" variant="flat" color="secondary">
                    {tPlaylist('audioCount', { count: playlist.audios.length })}
                  </Chip>
                  <div title={t('visibility.publicPlaylist')}>
                    <Globe size={20} className="text-success" />
                  </div>
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
              
              {/* Action Buttons */}
              <div className="w-full sm:w-auto sm:flex-shrink-0 flex flex-col gap-2">
                {/* Autoplay Button */}
                {playlist.audios.length > 0 && (
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<PlayCircle size={20} />}
                    onPress={handleStartAutoplay}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t('autoplay.start')}
                  </Button>
                )}
                
                {/* Save Offline Button */}
                {!isOffline && playlist.audios.length > 0 && (
                  <Button
                    color={isAvailableOffline ? "success" : "default"}
                    variant="flat"
                    startContent={
                      isAvailableOffline ? (
                        <CheckCircle size={18} />
                      ) : isCaching ? (
                        <Download size={18} className="animate-pulse" />
                      ) : (
                        <Download size={18} />
                      )
                    }
                    onPress={cachePlaylistForOffline}
                    isDisabled={isCaching || isAvailableOffline}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {isAvailableOffline 
                      ? 'Saved Offline' 
                      : isCaching 
                      ? `Saving ${cachingProgress.current}/${cachingProgress.total}...`
                      : 'Save All Offline'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Caching Progress */}
            {isCaching && cachingProgress.total > 0 && (
              <Progress 
                size="sm" 
                value={(cachingProgress.current / cachingProgress.total) * 100}
                color="primary"
                className="mt-2"
                aria-label="Caching progress"
              />
            )}
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
                  playlistId={playlist.id}
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