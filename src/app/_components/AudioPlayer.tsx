'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Button, Chip, Slider } from '@heroui/react';
import { Play, Pause, Square, ZoomIn, Gauge, SquareArrowOutUpRight } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';
import Link from 'next/link';
import type { AudioMarker } from '~/types/Audio';
import { formatTime } from '~/lib/time';

interface AudioPlayerProps {
  audioUrl: string;
  audioName: string;
  audioReadOnlyToken: string;
  markers?: AudioMarker[];
  onTimeUpdate?: (time: number) => void;
  onPlayFromFnReady?: (playFrom: (time: number) => void) => void;
}

export default function AudioPlayer({
  audioUrl,
  audioName,
  audioReadOnlyToken,
  markers = [],
  onTimeUpdate,
  onPlayFromFnReady,
}: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    console.log('AudioPlayer: Initializing WaveSurfe', waveformRef.current);
    if (!waveformRef.current) return;
    
    regionsPlugin.current = RegionsPlugin.create();
    regionsPlugin.current.on('region-clicked', (region, e) => {
      e.stopPropagation() // prevent triggering a click on the waveform
      region.play(true)
    })


    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#0070f0',
      progressColor: '#0052cc',
      cursorColor: '#0070f0',
      barWidth: 2,
      barRadius: 3,
      height: 100,
      normalize: true,
      mediaControls: false,
      plugins: [
        Timeline.create(),
        regionsPlugin.current
      ],
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));
  }, []);

  useEffect(() => {
    console.log('AudioPlayer: Loading audio', audioUrl);
    if (!wavesurfer.current) return;
    // Load audio
    void wavesurfer.current.load(audioUrl);

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);


  useEffect(() => {
    console.log('AudioPlayer: Setting up ready event listener');
    if (!wavesurfer.current) return;
    
    // Event listeners
    const unsubscribe = wavesurfer.current.on('ready', () => {
      console.log('AudioPlayer: Audio is ready');
      setIsLoading(false);
      wavesurfer.current?.zoom(0);  

      // Create regions from markers
      createRegionsFromMarkers(markers);
    });

    return () => {
      unsubscribe();
    };
  }, [markers]);


  useEffect(() => {
    console.log('AudioPlayer: Setting up time update event listener');
    if (!wavesurfer.current) return;
    wavesurfer.current.on('audioprocess', () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurfer.current.on('interaction', () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

  }, [onTimeUpdate]);

  // Create regions from markers
  const createRegionsFromMarkers = (markers: AudioMarker[]) => {
    if (!regionsPlugin.current || !wavesurfer.current) return;

    // Clear existing regions
    regionsPlugin.current.clearRegions();

    // Create regions from markers
    markers.forEach((marker) => {
      regionsPlugin.current?.addRegion({
        start: marker.timestamp,
        color: marker.color,
        content: marker.label,
        drag: false,
        resize: false,
      });
    });
  };

  // Update regions when markers change
  useEffect(() => {
    if (wavesurfer.current && !isLoading) {
      createRegionsFromMarkers(markers);
    }
  }, [markers, isLoading]);

  const handleZoomChange = (value: number | number[]) => {
    const zoom = Array.isArray(value) ? value[0] : value;
    if (typeof zoom === 'number') {
      setZoomLevel(zoom);
      if (wavesurfer.current) {
        wavesurfer.current.zoom(zoom);
      }
    }
  };

  const handlePlaybackRateChange = (value: number | number[]) => {
    const rate = Array.isArray(value) ? value[0] : value;
    if (typeof rate === 'number') {
      setPlaybackRate(rate);
      if (wavesurfer.current) {
        wavesurfer.current.setPlaybackRate(rate);
      }
    }
  };

  const handlePlayPause = () => {
    if (!wavesurfer.current) return;

    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      void wavesurfer.current.play();
    }
  };

  const handleStop = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const playFrom = useCallback((time: number) => {
    if (wavesurfer.current) {
      wavesurfer.current.seekTo(time / wavesurfer.current.getDuration());
      void wavesurfer.current.play();
    }
  }, []);

  // Expose playFrom function to parent component when ready
  useEffect(() => {
    if (!isLoading && onPlayFromFnReady) {
      onPlayFromFnReady(playFrom);
    }
  }, [isLoading, playFrom, onPlayFromFnReady]);


  return (
    <div className="relative w-full">
      <div className='flex justify-between'>
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-lg font-semibold">
            {audioName}
            <Link href={`/audios/${audioReadOnlyToken}/listen`}
              title='Link to publicly available read only player'><SquareArrowOutUpRight size={16} /></Link>
          </p>
          <p className="text-small text-default-500">Audio Player</p>
        </div>

        {/* Audio Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">Status:</span>
          <Chip
            size="sm"
            color={isPlaying ? "success" : "default"}
            variant="flat"
          >
            {isLoading ? "Loading" : isPlaying ? "Playing" : "Paused"}
          </Chip>
        </div>
      </div>

      {/* Waveform Container */}
      <div
        ref={waveformRef}
        className="w-full border border-default-200 rounded-lg p-2"
        style={{ minHeight: '100px' }}
      />

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay label='Audio is loading...' />}

      {/* Zoom and Playback Rate Controls */}
      <div className="flex flex-col sm:flex-row gap-4 my-4">
        {/* Zoom Control */}
        <div className="flex items-center gap-3 flex-1">
          <ZoomIn size={16} className="text-default-500" />
          <span className="text-sm text-default-500 min-w-12">Zoom:</span>
          <Slider
            size="sm"
            step={2}
            minValue={0}
            maxValue={100}
            value={zoomLevel}
            onChange={handleZoomChange}
            className="flex-1"
            color="primary"
            isDisabled={isLoading}
            aria-label="Waveform zoom level"
          />
          <span className="text-xs text-default-500 min-w-8">{zoomLevel}</span>
        </div>

        {/* Playback Rate Control */}
        <div className="flex items-center gap-3 flex-1">
          <Gauge size={16} className="text-default-500" />
          <span className="text-sm text-default-500 min-w-12">Speed:</span>
          <Slider
            size="sm"
            step={0.05}
            minValue={0.25}
            maxValue={2}
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            className="flex-1"
            color="primary"
            isDisabled={isLoading}
            aria-label="Playback rate"
          />
          <span className="text-xs text-default-500 min-w-8">{playbackRate.toFixed(2)}x</span>
        </div>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-default-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(wavesurfer.current?.getDuration() ?? 0)}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          isIconOnly
          size="lg"
          color="primary"
          variant="flat"
          onPress={handlePlayPause}
          isDisabled={isLoading}
          startContent={isPlaying ? <Pause size={24} /> : <Play size={24} />}
        >
        </Button>

        <Button
          isIconOnly
          size="lg"
          color="danger"
          variant="flat"
          onPress={handleStop}
          isDisabled={isLoading}
          startContent={<Square size={24} />}
        >
        </Button>
      </div>
    </div>
  );
}