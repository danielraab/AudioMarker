'use client';

import { Card, CardHeader, Chip, CardBody } from "@heroui/react";
import { api } from "~/trpc/react";
import type { AudioMarker } from '~/types/Audio';
import { Bookmark } from 'lucide-react';
import AddMarker from '../marker/AddMarker';
import MarkerList from '../marker/MarkerList';
import EmptyMarkerList from '../marker/EmptyMarkerList';

interface MarkerManagerProps {
  audioId: string;
  currentTime: number;
  markers: AudioMarker[];
  onMarkerClick?: (timestamp: number) => void;
}

export function StoredMarkerManager({ audioId, currentTime, markers, onMarkerClick }: MarkerManagerProps) {
  const utils = api.useUtils();

  const createMarker = api.marker.createMarker.useMutation({
    onSuccess: () => {
      utils.marker.getMarkers.invalidate({ audioId });
    },
  });

  const addMarkerAtCurrentTime = (label: string) => {
    createMarker.mutate({
      audioId,
      timestamp: currentTime,
      label: label.trim() || `Marker ${markers.length + 1}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
  };

  const deleteMarker = api.marker.deleteMarker.useMutation({
    onSuccess: () => {
      utils.marker.getMarkers.invalidate({ audioId });
    },
  });

  const onDeleteMarker = (markerId: string) => {
    deleteMarker.mutate({ id: markerId });
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className='flex flex-col items-start'>
        <div className='flex flex-row items-center gap-2 pb-2'>
          <Bookmark size={20} className="text-primary" />
          <h3 className="text-lg font-semibold">Stored Audio Markers</h3>
          <Chip size="sm" variant="flat" color="primary">
            {markers.length}
          </Chip>
        </div>
        <p className="text-small text-default-500">This Markers are stored in the database and are also available on the listening page.</p>
      </CardHeader>
      <CardBody className="space-y-4">


        {/* Add Stored Marker */}
        <div className="flex gap-2">
          <AddMarker currentTime={currentTime} onAddMarker={addMarkerAtCurrentTime} />
        </div>
        
        {/* Markers List */}
        {markers.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium text-default-600">
              Saved Markers:
            </h4>
            <MarkerList markers={markers}
              onMarkerClick={onMarkerClick}
              onRemoveMarker={onDeleteMarker} />
          </div>
        )}

        {markers.length === 0 && <EmptyMarkerList />}
      </CardBody>
    </Card>
  );
}