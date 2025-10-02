'use client';

import { ListenPlaylistAudioItem } from "./ListenPlaylistAudioItem";
import { Card, CardBody, Chip } from "@heroui/react";
import { Globe, User, ListMusic } from "lucide-react";
import { formatTimeAgo } from "~/lib/time";
import { notFound } from "next/navigation";
import type { PlaylistWithAudios } from "~/types/Playlist";

interface ListenPlaylistViewProps {
  playlist: PlaylistWithAudios;
}

export function ListenPlaylistView({ playlist }: ListenPlaylistViewProps) {
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
                  <div title="Public playlist">
                    <Globe size={20} className="text-success" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <Chip size="sm" variant="flat" color="secondary">
                    {playlist.audios.length} audio{playlist.audios.length !== 1 ? 's' : ''}
                  </Chip>
                </div>
                <div className="space-y-1 text-sm text-default-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span className="font-medium">Created by:</span>
                    <span>{playlist.createdBy.name ?? playlist.createdBy.email ?? 'Anonymous'}</span>
                  </div>
                  <p><span className="font-medium">Created:</span> {formatTimeAgo(new Date(playlist.createdAt))}</p>
                  <p><span className="font-medium">Last updated:</span> {formatTimeAgo(new Date(playlist.updatedAt))}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Audio List */}
        <section className="rounded-lg border border-default-200 bg-background p-3 sm:p-6">
          <header className="mb-4">
            <div className="flex flex-col">
              <p className="text-md font-semibold"><ListMusic className="inline" size={16} />Public Audios</p>
              <p className="text-small text-default-500">Public audio files in this playlist</p>
            </div>
          </header>

          {playlist.audios.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-default-500">No public audios in this playlist.</p>
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