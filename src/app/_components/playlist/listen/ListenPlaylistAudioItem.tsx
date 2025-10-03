'use client';

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Play } from "lucide-react";
import { formatTimeAgo } from "~/lib/time";
import type { PlaylistAudio } from "~/types/Playlist";

interface ListenPlaylistAudioItemProps {
  playlistAudio: PlaylistAudio;
}

export function ListenPlaylistAudioItem({ playlistAudio }: ListenPlaylistAudioItemProps) {
  const { audio } = playlistAudio;

  return (
    <Card className="shadow-sm">
      <CardBody className="gap-2">
        <div className="flex flex-row flex-wrap items-center gap-x-2">
          {/* Audio Info */}
          <h4 className="text-md font-semibold">{audio.name}</h4>

          <div className="grow flex justify-between items-center gap-2">
            <Chip size="sm" variant="flat" color="primary">
              {audio.markerCount} markers
            </Chip>
            {/* Actions */}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="primary"
                as="a"
                href={`/audios/${audio.id}/listen`}
                target="_blank"
                title="Play audio"
              >
                <Play size={16} />
              </Button>
          </div>
        </div>

        <div className="space-y-1 text-xs sm:text-sm text-default-500">
          <p><span className="font-medium">Original file:</span> {audio.originalFileName}</p>
          <p><span className="font-medium">Added to playlist:</span> {formatTimeAgo(new Date(playlistAudio.addedAt))}</p>
        </div>
      </CardBody>
    </Card>
  );
}