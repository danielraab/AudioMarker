'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Button, Chip, Slider } from '@heroui/react';
import { Play, Pause, Square, ZoomIn, Gauge, SquareArrowOutUpRight, Volume2 } from 'lucide-react';
import LoadingOverlay from '../global/LoadingOverlay';
import Link from 'next/link';
import type { AudioMarker } from '~/types/Audio';
import { formatTime } from '~/lib/time';
import { isSection } from '~/lib/marker';
import { useTranslations } from 'next-intl';

const markerIdPrefix = 'app-marker-';
const initialZoomLevel = 20;

interface AudioPlayerProps {
  audioUrl: string;
  audioName: string;
  audioReadOnlyToken: string;
  markers?: AudioMarker[];
  onTimeUpdate?: (time: number) => void;
  onPlayFromFnReady?: (playFrom: (marker: AudioMarker) => void) => void;
  onSelectedRegionUpdate?: (start: number | null, end: number | null) => void;
  onClearRegionReady?: (clearRegion: () => void) => void;
}

export default function AudioPlayer({
  audioUrl,
  audioName,
  audioReadOnlyToken,
  markers = [],
  onTimeUpdate,
  onPlayFromFnReady,
  onSelectedRegionUpdate,
  onClearRegionReady,
}: AudioPlayerProps) {
  const t = useTranslations('AudioPlayer');
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selectionRegionId = useRef<string | null>(null);
  const activeRegionId = useRef<string | null>(null);

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Create regions from markers - memoized to prevent unnecessary recreations
  const createRegionsFromMarkers = useCallback((markers: AudioMarker[]) => {
    if (!regionsPlugin.current || !wavesurfer.current) return;

    // Get existing marker regions
    const existingRegions = regionsPlugin.current.getRegions();
    const existingMarkerRegions = existingRegions.filter(r => r.id.startsWith(markerIdPrefix));

    // Create a set of new marker IDs
    const newMarkerIds = new Set(markers.map(m => markerIdPrefix + m.id));

    // Remove regions that no longer exist in markers
    existingMarkerRegions.forEach((region) => {
      if (!newMarkerIds.has(region.id)) {
        region.remove();
      }
    });

    // Add or update regions from markers
    markers.forEach((marker) => {
      const regionId = markerIdPrefix + marker.id;
      const markerIsSection = isSection(marker);

      // For sections, make color transparent by converting to hsla with low opacity
      const regionColor = markerIsSection && marker.color
        ? marker.color.replace('hsl(', 'hsla(').replace(')', ', 0.15)')
        : marker.color;

      // Check if region already exists
      const existingRegion = existingRegions.find(r => r.id === regionId);

      if (existingRegion) {
        // Update existing region if needed
        existingRegion.setOptions({
          start: marker.timestamp,
          end: markerIsSection ? marker.endTimestamp! : undefined,
          color: regionColor,
          content: marker.label,
        });
      } else {
        // Create new region
        regionsPlugin.current?.addRegion({
          id: regionId,
          start: marker.timestamp,
          end: markerIsSection ? marker.endTimestamp! : undefined,
          color: regionColor,
          content: marker.label,
          drag: false,
          resize: false,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize RegionsPlugin
    regionsPlugin.current = RegionsPlugin.create();

    const handleRegionDoubleClick = (region: Region, e: MouseEvent) => {
      e.stopPropagation(); // prevent triggering a click on the waveform
      activeRegionId.current = region.id;
      region.play();
    };
    const handleRegionOut = (region: Region) => {
      if (activeRegionId.current === region.id &&
          region.end !== region.start &&
          wavesurfer.current?.isPlaying()
      ) {
        region.play();
      }
    };
    const handleRegionUpdated = (region: Region) => {
      // Only track selection region updates
      if (region.id === selectionRegionId.current && onSelectedRegionUpdate) {
        onSelectedRegionUpdate(region.start, region.end);
      }
    };
    const handleRegionCreated = (region: Region) => {
      if (region.id.startsWith(markerIdPrefix)) {
        // It's a marker region, ignore
        return;
      }
      // If there's already a selection region, this might be a new one
      // Remove the old selection region if it exists
      if (selectionRegionId.current) {
        const existingRegion = regionsPlugin.current?.getRegions().find(r => r.id === selectionRegionId.current);
        if (existingRegion && existingRegion.id !== region.id) {
          existingRegion.remove();
        }
      }

      // Store the new selection region ID
      selectionRegionId.current = region.id;

      // Notify about the new region
      if (onSelectedRegionUpdate) {
        onSelectedRegionUpdate(region.start, region.end);
      }
    };

    // Set up region event listeners
    regionsPlugin.current.on('region-double-clicked', handleRegionDoubleClick);
    regionsPlugin.current.on('region-out', handleRegionOut);
    regionsPlugin.current.on('region-updated', handleRegionUpdated);
    regionsPlugin.current.on('region-created', handleRegionCreated);

    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      url: audioUrl,
      waveColor: '#0070f0',
      progressColor: '#0052cc',
      cursorColor: '#0070f0',
      barWidth: 2,
      barRadius: 3,
      height: 150,
      normalize: true,
      mediaControls: false,
      plugins: [
        Timeline.create(),
        regionsPlugin.current
      ],
    });

    // Enable drag selection for creating selection region
    regionsPlugin.current.enableDragSelection({
      color: 'rgba(0, 112, 240, 0.2)',
    });

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFinish = () => setIsPlaying(false);
    const handleReady = () => {
      setIsLoading(false);
      setLoadError(null);
      wavesurfer.current?.zoom(initialZoomLevel);
      createRegionsFromMarkers(markers);
    };
    const handleError = (error: Error) => {
      setIsLoading(false);
      setLoadError(error.message);
      console.error('Audio loading error:', error);
    };
    const handleAudioProcess = () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };
    const handleInteraction = () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      activeRegionId.current = null;
      onTimeUpdate?.(time);
    };

    // Set up WaveSurfer event listeners
    wavesurfer.current.on('play', handlePlay);
    wavesurfer.current.on('pause', handlePause);
    wavesurfer.current.on('finish', handleFinish);
    wavesurfer.current.on('ready', handleReady);
    wavesurfer.current.on('error', handleError);
    wavesurfer.current.on('audioprocess', handleAudioProcess);
    wavesurfer.current.on('interaction', handleInteraction);

    // Cleanup function
    return () => {
      if (regionsPlugin.current) {
        regionsPlugin.current.un('region-double-clicked', handleRegionDoubleClick);
        regionsPlugin.current.un('region-out', handleRegionOut);
        regionsPlugin.current.un('region-updated', handleRegionUpdated);
        regionsPlugin.current.un('region-created', handleRegionCreated);
      }
      if (wavesurfer.current) {
        wavesurfer.current.un('play', handlePlay);
        wavesurfer.current.un('pause', handlePause);
        wavesurfer.current.un('finish', handleFinish);
        wavesurfer.current.un('ready', handleReady);
        wavesurfer.current.un('error', handleError);
        wavesurfer.current.un('audioprocess', handleAudioProcess);
        wavesurfer.current.un('interaction', handleInteraction);
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl, onSelectedRegionUpdate, onTimeUpdate, createRegionsFromMarkers, markers]);

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

  const handleSpeedDoubleClick = () => {
    setPlaybackRate(1);
    wavesurfer.current?.setPlaybackRate(1);
  };

  const handleVolumeChange = (value: number | number[]) => {
    const vol = Array.isArray(value) ? value[0] : value;
    if (typeof vol === 'number') {
      setVolume(vol);
      if (wavesurfer.current) {
        wavesurfer.current.setVolume(vol / 100);
      }
    }
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const handlePlayPause = useCallback(() => {
    if (!wavesurfer.current) return;

    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      void wavesurfer.current.play();
    }
  }, [isPlaying]);

  const handleStop = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.stop();
    activeRegionId.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const playFrom = useCallback((marker: AudioMarker) => {
    if (wavesurfer.current) {
      if (regionsPlugin.current) {
        const region = regionsPlugin.current.getRegions().find(r => r.id === markerIdPrefix + marker.id);
        if (region) {
          activeRegionId.current = region.id;
          region.play();
          return;
        }
      }
      wavesurfer.current.seekTo(marker.timestamp / wavesurfer.current.getDuration());
    }
  }, []);

  const clearSelectionRegion = useCallback(() => {
    if (regionsPlugin.current && selectionRegionId.current) {
      const region = regionsPlugin.current.getRegions().find(r => r.id === selectionRegionId.current);
      if (region) {
        region.remove();
      }
      selectionRegionId.current = null;
      onSelectedRegionUpdate?.(null, null);
    }
  }, [onSelectedRegionUpdate]);

  // Expose playFrom function to parent component when ready
  useEffect(() => {
    if (!isLoading && onPlayFromFnReady) {
      onPlayFromFnReady(playFrom);
    }
  }, [isLoading, playFrom, onPlayFromFnReady]);

  // Expose clearSelectionRegion function to parent component when ready
  useEffect(() => {
    if (!isLoading && onClearRegionReady) {
      onClearRegionReady(clearSelectionRegion);
    }
  }, [isLoading, clearSelectionRegion, onClearRegionReady]);

  // Keyboard event listener for spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle spacebar when audio is loaded and not in an input field
      if (
        event.code === 'Space' &&
        !isLoading &&
        wavesurfer.current &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target as Element)?.getAttribute('contenteditable')
      ) {
        event.preventDefault(); // Prevent page scroll
        handlePlayPause();
      }
    };

    // Add global keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, handlePlayPause]);

  // Click outside to close volume slider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showVolumeSlider &&
        volumeControlRef.current &&
        !volumeControlRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    };

    // Add listener when volume slider is shown
    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeSlider]);


  return (
    <div className="relative w-full">
      <div className='flex justify-between'>
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-lg font-semibold">
            {audioName}
            <Link href={`/audios/${audioReadOnlyToken}/listen`}
              title={t('publicLinkTitle')}><SquareArrowOutUpRight size={16} /></Link>
          </p>
          <p className="text-small text-default-500">{t('subtitle')}</p>
        </div>

        {/* Audio Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-default-500">{t('status.label')}</span>
          <Chip
            size="sm"
            color={isPlaying ? "success" : "default"}
            variant="flat"
          >
            {isLoading ? t('status.loading') : isPlaying ? t('status.playing') : t('status.paused')}
          </Chip>
        </div>
      </div>

      {/* Waveform Container */}
      <div
        ref={waveformRef}
        className="w-full border border-default-200 rounded-lg p-2"
        style={{ minHeight: '100px' }}
      />

      {/* Error Display */}
      {loadError && (
        <div className="my-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger-600 font-semibold">{t('error.title')}</p>
          <p className="text-danger-500 text-sm mt-1">{t('error.message')}</p>
          <p className="text-danger-400 text-xs mt-2">{loadError}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay label={t('loadingLabel')} />}

      {/* Zoom and Playback Rate Controls */}
      <div className="flex flex-col sm:flex-row gap-4 my-4">
        {/* Zoom Control */}
        <div className="flex items-center gap-3 flex-1">
          <ZoomIn size={16} className="text-default-500" />
          <span className="text-sm text-default-500 min-w-12">{t('zoom.label')}</span>
          <Slider
            size="sm"
            step={2}
            minValue={0}
            maxValue={100}
            value={zoomLevel}
            onChange={handleZoomChange}
            className="flex-1"
            color="primary"
            isDisabled={mounted && isLoading}
            aria-label={t('zoom.ariaLabel')}
          />
          <span className="text-xs text-default-500 min-w-8">{zoomLevel}</span>
        </div>

        {/* Playback Rate Control */}
        <div className="flex items-center gap-3 flex-1">
          <div
            onDoubleClick={handleSpeedDoubleClick}
            className="cursor-pointer select-none flex items-center gap-1"
            title={t('speed.resetTitle')}
          >
            <Gauge
              size={16}
              className="text-default-500"
            />
            <span
              className="text-sm text-default-500 min-w-12"
            >
              {t('speed.label')}
            </span>
          </div>
          <Slider
            size="sm"
            step={0.05}
            minValue={0.25}
            maxValue={2}
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            className="flex-1"
            color="primary"
            isDisabled={mounted && isLoading}
            aria-label={t('speed.ariaLabel')}
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
          isDisabled={mounted && isLoading}
          aria-label={isPlaying ? t('controls.pause') : t('controls.play')}
          startContent={isPlaying ? <Pause size={24} /> : <Play size={24} />}
        >
        </Button>

        <Button
          isIconOnly
          size="lg"
          color="danger"
          variant="flat"
          onPress={handleStop}
          isDisabled={mounted && isLoading}
          aria-label={t('controls.stop')}
          startContent={<Square size={24} />}
        >
        </Button>

        {/* Volume Control with Overlay */}
        <div className="relative" ref={volumeControlRef}>
          <Button
            isIconOnly
            size="lg"
            color="default"
            variant="flat"
            onPress={toggleVolumeSlider}
            isDisabled={mounted && isLoading}
            aria-label={t('volume.toggleLabel')}
            startContent={<Volume2 size={24} />}
          >
          </Button>

          {/* Volume Slider Overlay */}
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-default-100 border border-default-200 rounded-lg shadow-lg p-3 min-w-[200px]">
              <div className="flex items-center gap-3">
                <Slider
                  size="sm"
                  step={1}
                  minValue={0}
                  maxValue={100}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1"
                  color="primary"
                  isDisabled={mounted && isLoading}
                  aria-label={t('volume.ariaLabel')}
                />
                <span className="text-xs text-default-500 min-w-12">{volume}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}