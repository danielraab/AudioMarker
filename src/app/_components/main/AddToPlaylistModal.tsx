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
import { Plus, Search, Music, Check } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "~/lib/time";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioId: string;
}

export function AddToPlaylistModal({ isOpen, onClose, audioId }: AddToPlaylistModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const utils  = api.useUtils();

  const { data: playlists, isLoading } = api.playlist.getUserPlaylistsForAudio.useQuery(
    { audioId },
    { enabled: isOpen }
  );

  const addAudioMutation = api.playlist.addAudioToPlaylist.useMutation({
    onSuccess: () => {
      router.refresh();
      void utils.playlist.getUserPlaylistsForAudio.invalidate({ audioId });
    },
    onError: (error) => {
      console.error("Add audio to playlist error:", error);
    },
  });

  const handleAddToPlaylist = (playlistId: string) => {
    addAudioMutation.mutate({
      playlistId,
      audioId,
    });
  };

  const filteredPlaylists = playlists?.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          Add to Playlist
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
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search size={16} />}
                className="mb-4"
              />

              {/* Available Playlists */}
              {filteredPlaylists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-default-500">
                    {searchTerm ? 'No playlists match your search.' : 'No playlists found.'}
                  </p>
                  {!searchTerm && (
                    <p className="text-small text-default-400 mt-2">
                      Create your first playlist to organize your audio files.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredPlaylists.map((playlist) => (
                    <Card key={playlist.id} className="shadow-sm">
                      <CardBody className="gap-2">
                        <div className="flex flex-row justify-between items-center gap-2">
                          <div className="grow flex items-center gap-2">
                            <Music size={16} className="text-primary" />
                            <h4 className="text-md font-semibold truncate">{playlist.name}</h4>
                            <Chip size="sm" variant="flat" color="secondary">
                              {playlist.audioCount} audio{playlist.audioCount !== 1 ? 's' : ''}
                            </Chip>
                          </div>
                          {playlist.hasAudio ? (
                            <Button
                              color="success"
                              size="sm"
                              startContent={<Check size={14} />}
                              isDisabled
                              variant="flat"
                            >
                              Added
                            </Button>
                          ) : (
                            <Button
                              color="primary"
                              size="sm"
                              startContent={<Plus size={14} />}
                              onPress={() => handleAddToPlaylist(playlist.id)}
                              isLoading={addAudioMutation.isPending}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-default-500">
                          <p><span className="font-medium">Created:</span> {formatTimeAgo(new Date(playlist.createdAt))}</p>
                          <p><span className="font-medium">Visibility:</span> {playlist.isPublic ? 'Public' : 'Private'}</p>
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