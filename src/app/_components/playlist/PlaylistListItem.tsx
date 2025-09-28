'use client';

import { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Chip } from "@heroui/react";
import { Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { PlaylistActionsDropdown } from "./PlaylistActionsDropdown";
import { formatTimeAgo } from "~/lib/time";

interface PlaylistListItemProps {
  playlist: {
    id: string;
    name: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    audioCount: number;
  };
}

export function PlaylistListItem({ playlist }: PlaylistListItemProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");

  const deletePlaylistMutation = api.playlist.deletePlaylist.useMutation({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleDeleteClick = () => {
    setSelectedPlaylistId(playlist.id);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedPlaylistId) {
      deletePlaylistMutation.mutate({ id: selectedPlaylistId });
    }
  };

  const handleEditClick = () => {
    router.push(`/playlists/${playlist.id}/edit`);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardBody className="gap-2">
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="grow flex items-center gap-2">
              <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
              <Chip size="sm" variant="flat" color="secondary">
                {playlist.audioCount} audio{playlist.audioCount !== 1 ? 's' : ''}
              </Chip>
              <div className="flex items-center" title={playlist.isPublic ? "Public" : "Private"}>
                {playlist.isPublic ? (
                  <Globe size={16} className="text-success" />
                ) : (
                  <Lock size={16} className="text-warning" />
                )}
              </div>
            </div>
            <div>
              <PlaylistActionsDropdown
                playlistId={playlist.id}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                isDeleteDisabled={deletePlaylistMutation.isPending}
              />
            </div>
          </div>
          <div className="space-y-1 text-sm text-default-500">
            <p><span className="font-medium">Created:</span> {formatTimeAgo(new Date(playlist.createdAt))}</p>
            <p><span className="font-medium">Last updated:</span> {formatTimeAgo(new Date(playlist.updatedAt))}</p>
          </div>
        </CardBody>
      </Card>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Playlist</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this playlist? This will not delete the audio files, only the playlist. This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={deletePlaylistMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}