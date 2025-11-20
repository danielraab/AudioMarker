'use client';

import { useState, useCallback } from 'react';
import { api } from "~/trpc/react";
import { StoredMarkerManager } from './StoredMarkerManager';
import AudioPlayer from '../AudioPlayer';
import type { AudioMarker } from '~/types/Audio';

interface EditPageContainerProps {
  audioId: string;
}

export function EditPageContainer({ audioId }: EditPageContainerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [playFromFunction, setPlayFromFunction] = useState<((marker: AudioMarker) => void) | null>(null);
  const [clearRegionFunction, setClearRegionFunction] = useState<(() => void) | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });

  const [audio] = api.audio.getUserAudioById.useSuspenseQuery({ id: audioId });
  const [markers] = api.marker.getMarkers.useSuspenseQuery({ audioId });

  //for player -> marker manager
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);
  
  const handleSelectedRegionUpdate = useCallback((start: number | null, end: number | null) => {
    setSelectedRegion({ start, end });
  }, []);
  
  const handleClearRegionReady = useCallback((clearRegion: () => void) => {
    setClearRegionFunction(() => clearRegion);
  }, []);

  const handlePlayFromFnReady = useCallback((seekTo: (marker: AudioMarker) => void) => {
    setPlayFromFunction(() => seekTo);
  }, []);

  // from marker manager -> player
  const handleMarkerClick = useCallback((marker: AudioMarker) => {
    if (playFromFunction) {
      playFromFunction(marker);
    }
  }, [playFromFunction]);

  return (
    <div className="w-full flex flex-col items-center mx-auto space-y-6">
      
      <AudioPlayer
        audioUrl={audio.filePath}
        audioName={audio.name}
        audioReadOnlyToken={audio.id}
        markers={markers}
        onTimeUpdate={handleTimeUpdate}
        onPlayFromFnReady={handlePlayFromFnReady}
        onSelectedRegionUpdate={handleSelectedRegionUpdate}
        onClearRegionReady={handleClearRegionReady}
      />

      <StoredMarkerManager
        audioId={audioId}
        currentTime={currentTime}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        selectedRegion={selectedRegion}
        onClearRegion={clearRegionFunction}
      />
    </div>
  );
}