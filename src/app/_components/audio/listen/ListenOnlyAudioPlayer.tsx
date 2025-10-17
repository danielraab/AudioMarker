'use client';

import React, { useState, useCallback } from 'react';
import AudioPlayer from '../AudioPlayer';
import BrowserMarkerManager from './BrowserMarkerManager';
import type { AudioMarker } from '~/types/Audio';
import { api } from "~/trpc/react";
import StoredMarkers from './StoredMarkers';
import { useIncrementListenCount } from '~/lib/hooks/useIncrementListenCount';

interface AudioPlayerWithMarkersProps {
  audioUrl: string;
  audioName: string;
  audioReadOnlyToken: string;
  audioId: string;
}

export default function ListenOnlyAudioPlayer({ 
  audioUrl, 
  audioName, 
  audioReadOnlyToken,
  audioId 
}: AudioPlayerWithMarkersProps) {
  const [markers, setMarkers] = useState<AudioMarker[]>([]);
  const [ storedMarkers ] = api.marker.getMarkers.useSuspenseQuery({ audioId });
  const [currentTime, setCurrentTime] = useState(0);
  const [playFromFunction, setPlayFromFunction] = useState<((time: number) => void) | null>(null);

  // Use audioId or fallback to readonlyToken for unique identification
  const uniqueAudioId = audioId || audioReadOnlyToken;

  // Mutation to increment listen count
  const incrementListenCount = api.audio.incrementListenCount.useMutation();

  // Increment listen count (only once per 2 hours per browser/tab)
  useIncrementListenCount({
    id: audioId,
    type: 'audio',
    incrementMutation: incrementListenCount,
  });

  const handleMarkersChange = useCallback((newMarkers: AudioMarker[]) => {
    setMarkers(newMarkers);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePlayFromFnReady = useCallback((seekTo: (time: number) => void) => {
    setPlayFromFunction(() => seekTo);
  }, []);

  const handleMarkerClick = useCallback((timestamp: number) => {
    if (playFromFunction) {
      playFromFunction(timestamp);
    }
  }, [playFromFunction]);


  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Audio Player */}
      <AudioPlayer
        audioUrl={audioUrl}
        audioName={audioName}
        audioReadOnlyToken={audioReadOnlyToken}
        markers={[...markers, ...storedMarkers]}
        onTimeUpdate={handleTimeUpdate}
        onPlayFromFnReady={handlePlayFromFnReady}
      />

      <div className='flex flex-col items-center space-y-6'>
        
        {/* Stored Markers */}
        <StoredMarkers
          markers={storedMarkers}
          onMarkerClick={handleMarkerClick}
        />

        {/* Marker Manager */}
        <BrowserMarkerManager
          audioId={uniqueAudioId}
          currentTime={currentTime}
          onMarkersChange={handleMarkersChange}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
}