'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
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
  onRegionUpdate?: (start: number | null, end: number | null) => void;
  onClearRegionReady?: (clearRegion: () => void) => void;
}

export default function AudioPlayer({
  audioUrl,
  audioName,
  audioReadOnlyToken,
  markers = [],
  onTimeUpdate,
  onPlayFromFnReady,
  onRegionUpdate,
  onClearRegionReady,
}: AudioPlayerProps) {
  const t = useTranslations('AudioPlayer');
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const selectionRegionId = useRef<string | null>(null);
  const activeRegionId = useRef<string | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    regionsPlugin.current = RegionsPlugin.create();
    regionsPlugin.current.on('region-double-clicked', (region, e) => {
      e.stopPropagation() // prevent triggering a click on the waveform
      activeRegionId.current = region.id;
      region.play()
    })

    regionsPlugin.current.on('region-out', (region) => {
      console.log('region-out', region.id);
      if (activeRegionId.current === region.id && wavesurfer.current?.isPlaying()) {
          region.play();
      }
    });

    // Listen for region updates (drag/resize)
    regionsPlugin.current.on('region-updated', (region) => {
      // Only track selection region updates
      if (region.id === selectionRegionId.current && onRegionUpdate) {
        onRegionUpdate(region.start, region.end);
      }
    })

    // Ensure only one manual selection region exists
    regionsPlugin.current.on('region-created', (region) => {
      if(region.id.startsWith(markerIdPrefix)) {
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
      if (onRegionUpdate) {
        onRegionUpdate(region.start, region.end);
      }
    });


    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
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

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));
  }, [onRegionUpdate]);

  useEffect(() => {
    if (!wavesurfer.current) return;
    // Load audio
    void wavesurfer.current.load(audioUrl);

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);


  useEffect(() => {
    if (!wavesurfer.current) return;

    // Event listeners
    const unsubscribe = wavesurfer.current.on('ready', () => {
      setIsLoading(false);
      wavesurfer.current?.zoom(initialZoomLevel);

      // Create regions from markers
      createRegionsFromMarkers(markers);
    });

    return () => {
      unsubscribe();
    };
  }, [markers]);


  useEffect(() => {
    if (!wavesurfer.current) return;
    wavesurfer.current.on('audioprocess', () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurfer.current.on('interaction', () => {
      const time = wavesurfer.current?.getCurrentTime() ?? 0;
      setCurrentTime(time);
      activeRegionId.current = null;
      onTimeUpdate?.(time);
    });

  }, [onTimeUpdate]);

  // Create regions from markers
  const createRegionsFromMarkers = (markers: AudioMarker[]) => {
    if (!regionsPlugin.current || !wavesurfer.current) return;

    // Clear all regions except the selection region
    const existingRegions = regionsPlugin.current.getRegions();
    existingRegions.forEach((region) => {
      if (region.id !== selectionRegionId.current) {
        region.remove();
      }
    });

    // Create regions from markers
    markers.forEach((marker) => {
      const markerIsSection = isSection(marker);

      // For sections, make color transparent by converting to hsla with low opacity
      const regionColor = markerIsSection && marker.color
        ? marker.color.replace('hsl(', 'hsla(').replace(')', ', 0.15)')
        : marker.color;

      regionsPlugin.current?.addRegion({
        id: markerIdPrefix + marker.id,
        start: marker.timestamp,
        end: markerIsSection ? marker.endTimestamp! : undefined,
        color: regionColor,
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
      if(regionsPlugin.current) {
        const region = regionsPlugin.current.getRegions().find(r => r.id === markerIdPrefix + marker.id);
        if(region) {
          activeRegionId.current = region.id;
          region.play();
          return;
        }
      }
      wavesurfer.current.seekTo(marker.timestamp / wavesurfer.current.getDuration());

      void wavesurfer.current.play();
    }
  }, []);

  const clearSelectionRegion = useCallback(() => {
    if (regionsPlugin.current && selectionRegionId.current) {
      const region = regionsPlugin.current.getRegions().find(r => r.id === selectionRegionId.current);
      if (region) {
        region.remove();
      }
      selectionRegionId.current = null;
      onRegionUpdate?.(null, null);
    }
  }, [onRegionUpdate]);

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
            isDisabled={isLoading}
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
            isDisabled={isLoading}
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
          isDisabled={isLoading}
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
          isDisabled={isLoading}
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
            isDisabled={isLoading}
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
                  isDisabled={isLoading}
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