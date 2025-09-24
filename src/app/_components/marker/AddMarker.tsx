import { Button, Input } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { formatTime } from "~/lib/time";

interface AddMarkerProps {
  currentTime: number;
  onAddMarker: (label: string) => void;
}

export default function AddMarker({ currentTime, onAddMarker }: AddMarkerProps) {
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  return (<>
    <Input
      size="sm"
      placeholder="Marker label (optional)"
      value={newMarkerLabel}
      onValueChange={setNewMarkerLabel}
      className="flex-1"
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onAddMarker(newMarkerLabel);
        }
      }}
    />

    {/* Quick Add Marker at Current Time */}
    <div className="flex gap-2">
      <Button
        size="sm"
        color="success"
        variant="flat"
        onPress={() => onAddMarker(newMarkerLabel)}
        startContent={<Plus size={16} />}
        className="flex-shrink-0"
      >
        Add at {formatTime(currentTime)}
      </Button>
    </div>
  </>);
}