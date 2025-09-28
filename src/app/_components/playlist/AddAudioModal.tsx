'use client';

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Spinner,
  Input
} from "@heroui/react";
import { Plus, Search, Check } from "lucide-react";
import { api } from "~/trpc/react";
import { formatTimeAgo } from "~/lib/time";

interface AddAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onAudioAdded: () => void;
}

export function AddAudioModal({ isOpen, onClose, playlistId, onAudioAdded }: AddAudioModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const utils = api.useUtils();

  const { data: allAudios, isLoading } = api.playlist.getAllAudiosForPlaylist.useQuery(
    { playlistId },
    { enabled: isOpen }
  );

  const addAudioMutation = api.playlist.addAudioToPlaylist.useMutation({
    onSuccess: () => {
      void utils.playlist.getAllAudiosForPlaylist.invalidate({ playlistId: playlistId });
      onAudioAdded();
    },
    onError: (error) => {
      console.error("Add audio error:", error);
    },
  });

  const handleAddAudio = (audioId: string) => {
    addAudioMutation.mutate({
      playlistId,
      audioId,
    });
  };

  const filteredAudios = allAudios?.filter(audio =>
    audio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Add Audio to Playlist
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Search */}
              <Input
                placeholder="Search audio files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search size={16} />}
                className="mb-4"
              />

              {/* Available Audios */}
              {filteredAudios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-default-500">
                    {searchTerm ? 'No audio files match your search.' : 'No audio files found.'}
                  </p>
                  {!searchTerm && (
                    <p className="text-small text-default-400 mt-2">
                      Create your first audio file to add to playlists.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAudios.map((audio) => (
                    <Card key={audio.id} className="shadow-sm">
                      <CardBody className="gap-2">
                        <div className="flex flex-row justify-between items-center gap-2">
                          <div className="grow flex items-center gap-2">
                            <h4 className="text-md font-semibold truncate">{audio.name}</h4>
                            <Chip size="sm" variant="flat" color="primary">
                              {audio.markerCount} markers
                            </Chip>
                          </div>
                          {audio.isInPlaylist ? (
                            <Button
                              color="success"
                              size="sm"
                              startContent={<Check size={14} />}
                              isDisabled
                              variant="flat"
                            >
                              In Playlist
                            </Button>
                          ) : (
                            <Button
                              color="primary"
                              size="sm"
                              startContent={<Plus size={14} />}
                              onPress={() => handleAddAudio(audio.id)}
                              isLoading={addAudioMutation.isPending}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-default-500">
                          <p><span className="font-medium">Original file:</span> {audio.originalFileName}</p>
                          <p><span className="font-medium">Uploaded:</span> {formatTimeAgo(new Date(audio.createdAt))}</p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}