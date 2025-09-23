'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Button, Chip, Slider } from '@heroui/react';
import { Play, Pause, Square, ZoomIn, SquareArrowOutUpRight } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';
import Link from 'next/link';

interface AudioPlayerProps {
  audioUrl: string;
  audioName: string;
  audioReadOnlyToken: string;
}

export default function AudioPlayer({ audioUrl, audioName, audioReadOnlyToken }: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);


  useEffect(() => {
    if (!waveformRef.current) return;

    regionsPlugin.current = RegionsPlugin.create();

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
    
    // Load audio
    wavesurfer.current.load(audioUrl);

    // Event listeners
    wavesurfer.current.on('ready', () => {
      setIsLoading(false);
      wavesurfer.current?.zoom(zoomLevel);
      setDuration(wavesurfer.current?.getDuration() || 0);
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    wavesurfer.current.on('interaction', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const handleZoomChange = (value: number | number[]) => {
    const zoom = Array.isArray(value) ? value[0] : value;
    if (typeof zoom === 'number') {
      setZoomLevel(zoom);
      if (wavesurfer.current) {
        wavesurfer.current.zoom(zoom);
      }
    }
  };

  const handlePlayPause = () => {
    if (!wavesurfer.current) return;

    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      wavesurfer.current.play();
    }
  };

  const handleStop = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="relative">
      <div className='flex justify-between'>
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-lg font-semibold">
            {audioName}
            <Link href={`/listen/${audioReadOnlyToken}`}
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

      {/* Zoom Control */}
      <div className="flex items-center gap-3 my-4">
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

      {/* Time Display */}
      <div className="flex justify-between text-sm text-default-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
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