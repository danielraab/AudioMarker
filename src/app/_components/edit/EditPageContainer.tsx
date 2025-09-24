'use client';

import { useState, useCallback } from 'react';
import { api } from "~/trpc/react";
import { StoredMarkerManager } from './StoredMarkerManager';
import AudioPlayer from '../AudioPlayer';

interface EditPageContainerProps {
  audioId: string;
}

export function EditPageContainer({ audioId }: EditPageContainerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToFunction, setSeekToFunction] = useState<((time: number) => void) | null>(null);

  const [audio] = api.audio.getAudioById.useSuspenseQuery({ id: audioId });
  const [markers] = api.marker.getMarkers.useSuspenseQuery({ audioId });

  //for player -> marker manager
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeekToReady = useCallback((seekTo: (time: number) => void) => {
    setSeekToFunction(() => seekTo);
  }, []);

  // from marker manager -> player
  const handleMarkerClick = useCallback((timestamp: number) => {
    if (seekToFunction) {
      seekToFunction(timestamp);
    }
  }, [seekToFunction]);

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      
      <AudioPlayer
        audioUrl={audio.filePath}
        audioName={audio.name}
        audioReadOnlyToken={audio.readonlyToken}
        markers={markers}
        onTimeUpdate={handleTimeUpdate}
        onSeekToReady={handleSeekToReady}
      />

      <StoredMarkerManager
        audioId={audioId}
        currentTime={currentTime}
        markers={markers}
        onMarkerClick={handleMarkerClick}
      />
    </div>
  );
}