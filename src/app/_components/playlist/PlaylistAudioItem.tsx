'use client';

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { GripVertical, X, Play, Edit } from "lucide-react";
import { formatTimeAgo } from "~/lib/time";
import type { PlaylistAudio } from "~/types/Playlist";

interface PlaylistAudioItemProps {
  playlistAudio: PlaylistAudio;
  onRemove: () => void;
  isRemoving: boolean;
}


export function PlaylistAudioItem({ playlistAudio, onRemove, isRemoving }: PlaylistAudioItemProps) {
  const { audio } = playlistAudio;

  return (
    <Card className="shadow-sm">
      <CardBody className="gap-2 p-3 sm:p-4">
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          {/* Drag Handle */}
          <div className="flex items-center text-default-400 cursor-grab active:cursor-grabbing flex-shrink-0">
            <GripVertical size={16} />
          </div>

          {/* Audio Info */}
          <div className="grow flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <h4 className="text-sm sm:text-md font-semibold truncate">{audio.name}</h4>
            <Chip size="sm" variant="flat" color="primary" className="w-fit">
              {audio.markerCount} markers
            </Chip>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="secondary"
              as="a"
              href={`/audios/${audio.id}/edit`}
              title="Edit audio"
            >
              <Edit size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={onRemove}
              isLoading={isRemoving}
              title="Remove from playlist"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-1 text-xs sm:text-sm text-default-500 ml-6 sm:ml-7">
          <p className="truncate"><span className="font-medium">Original file:</span> {audio.originalFileName}</p>
          <p><span className="font-medium">Added to playlist:</span> {formatTimeAgo(new Date(playlistAudio.addedAt))}</p>
        </div>
      </CardBody>
    </Card>
  );
}