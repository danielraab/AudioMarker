'use client';

import React, { useState, useCallback } from 'react';
import AudioPlayer from '../AudioPlayer';
import BrowserMarkerManager from './BrowserMarkerManager';
import type { AudioMarker } from '~/types/Audio';

interface AudioPlayerWithMarkersProps {
  audioUrl: string;
  audioName: string;
  audioReadOnlyToken: string;
  audioId?: string;
}

export default function ListenOnlyAudioPlayer({ 
  audioUrl, 
  audioName, 
  audioReadOnlyToken,
  audioId 
}: AudioPlayerWithMarkersProps) {
  const [markers, setMarkers] = useState<AudioMarker[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToFunction, setSeekToFunction] = useState<((time: number) => void) | null>(null);

  // Use audioId or fallback to readonlyToken for unique identification
  const uniqueAudioId = audioId || audioReadOnlyToken;

  const handleMarkersChange = useCallback((newMarkers: AudioMarker[]) => {
    setMarkers(newMarkers);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSeekToReady = useCallback((seekTo: (time: number) => void) => {
    setSeekToFunction(() => seekTo);
  }, []);

  const handleMarkerClick = useCallback((timestamp: number) => {
    if (seekToFunction) {
      seekToFunction(timestamp);
    }
  }, [seekToFunction]);


  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <AudioPlayer
        audioUrl={audioUrl}
        audioName={audioName}
        audioReadOnlyToken={audioReadOnlyToken}
        markers={markers}
        onTimeUpdate={handleTimeUpdate}
        onSeekToReady={handleSeekToReady}
      />

      {/* Marker Manager */}
      <BrowserMarkerManager
        audioId={uniqueAudioId}
        currentTime={currentTime}
        onMarkersChange={handleMarkersChange}
        onMarkerClick={handleMarkerClick}
      />
    </div>
  );
}