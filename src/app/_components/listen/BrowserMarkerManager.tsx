'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { Plus, Trash2, Bookmark } from 'lucide-react';

export interface AudioMarker {
  id: string;
  timestamp: number;
  label: string;
  color?: string;
}

interface MarkerManagerProps {
  audioId: string;
  currentTime: number;
  onMarkersChange: (markers: AudioMarker[]) => void;
  onMarkerClick?: (timestamp: number) => void;
}

export default function BrowserMarkerManager({
  audioId,
  currentTime,
  onMarkersChange,
  onMarkerClick
}: MarkerManagerProps) {
  const [markers, setMarkers] = useState<AudioMarker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  // Load markers from localStorage on component mount
  useEffect(() => {
    const savedMarkers = localStorage.getItem(`audioMarkers_${audioId}`);
    if (savedMarkers) {
      try {
        const parsedMarkers = JSON.parse(savedMarkers) as AudioMarker[];
        setMarkers(parsedMarkers);
        onMarkersChange(parsedMarkers);
      } catch (error) {
        console.error('Error parsing saved markers:', error);
      }
    }
  }, [audioId, onMarkersChange]);

  // Save markers to localStorage whenever markers change
  useEffect(() => {
    localStorage.setItem(`audioMarkers_${audioId}`, JSON.stringify(markers));
    onMarkersChange(markers);
  }, [markers, audioId, onMarkersChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
  };

  const addMarkerAtCurrentTime = () => {
    const newMarker: AudioMarker = {
      id: `marker_${Date.now()}`,
      timestamp: currentTime,
      label: newMarkerLabel.trim() || `Marker ${markers.length + 1}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    setMarkers(prev => [...prev, newMarker].sort((a, b) => a.timestamp - b.timestamp));
    setNewMarkerLabel('');
  };

  return (
    <Card className="w-full">
      <CardHeader className='flex flex-col items-start'>
        <div className='flex flex-row items-center gap-2 pb-2'>
          <Bookmark size={20} className="text-primary" />
          <h3 className="text-lg font-semibold">Browser Audio Markers</h3>
          <Chip size="sm" variant="flat" color="primary">
            {markers.length}
          </Chip>
        </div>
        <p className="text-small text-default-500">This Markers are only available in this browser.</p>
      </CardHeader>
      <CardBody className="space-y-4">

        {/* Add Custom Marker */}
        <div className="flex gap-2">
          <Input
            size="sm"
            placeholder="Marker label (optional)"
            value={newMarkerLabel}
            onValueChange={setNewMarkerLabel}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addMarkerAtCurrentTime();
              }
            }}
          />

          {/* Quick Add Marker at Current Time */}
          <div className="flex gap-2">
            <Button
              size="sm"
              color="success"
              variant="flat"
              onPress={addMarkerAtCurrentTime}
              startContent={<Plus size={16} />}
              className="flex-shrink-0"
            >
              Add at {formatTime(currentTime)}
            </Button>
          </div>
        </div>

        {/* Markers List */}
        {markers.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium text-default-600">
              Saved Markers:
            </h4>
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="flex items-center justify-between p-2 bg-default-100 rounded-lg"
              >
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-default-200 -m-2 p-2 rounded-lg transition-colors"
                  onClick={() => onMarkerClick?.(marker.timestamp)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onMarkerClick?.(marker.timestamp);
                    }
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: marker.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {marker.label}
                    </p>
                    <p className="text-xs text-default-500">
                      {formatTime(marker.timestamp)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  isIconOnly
                  onPress={() => removeMarker(marker.id)}
                  startContent={<Trash2 size={14} />}
                />
              </div>
            ))}
          </div>
        )}

        {markers.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-default-500">
              No markers added yet. Use the buttons above to add markers at specific timestamps.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}