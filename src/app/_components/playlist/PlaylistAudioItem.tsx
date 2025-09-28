'use client';

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { GripVertical, X, Play } from "lucide-react";
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
      <CardBody className="gap-2">
        <div className="flex flex-row items-center gap-3">
          {/* Drag Handle */}
          <div className="flex items-center text-default-400 cursor-grab active:cursor-grabbing">
            <GripVertical size={16} />
          </div>

          {/* Audio Info */}
          <div className="grow flex items-center gap-2">
            <h4 className="text-md font-semibold truncate">{audio.name}</h4>
            <Chip size="sm" variant="flat" color="primary">
              {audio.markerCount} markers
            </Chip>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              as="a"
              href={`/listen/${audio.readonlyToken}`}
              target="_blank"
              title="Play audio"
            >
              <Play size={16} />
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

        <div className="space-y-1 text-sm text-default-500 ml-7">
          <p><span className="font-medium">Original file:</span> {audio.originalFileName}</p>
          <p><span className="font-medium">Added to playlist:</span> {formatTimeAgo(new Date(playlistAudio.addedAt))}</p>
        </div>
      </CardBody>
    </Card>
  );
}