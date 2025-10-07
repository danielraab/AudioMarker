'use client';

import { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody, Chip } from "@heroui/react";
import { Globe, Lock, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { AudioActionsDropdown } from "./AudioActionsDropdown";
import { formatTimeAgo } from "~/lib/time";

interface AudioListItemProps {
  audio: {
    id: string;
    name: string;
    originalFileName: string;
    createdAt: Date;
    markerCount: number;
    isPublic: boolean;
    listenCounter?: number;
    lastListenAt?: Date | null;
  };
}

export function AudioListItem({ audio }: AudioListItemProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");

  const deleteAudioMutation = api.audio.deleteAudio.useMutation({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleDeleteClick = () => {
    setSelectedAudioId(audio.id);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedAudioId) {
      deleteAudioMutation.mutate({ id: selectedAudioId });
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardBody className="gap-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1 flex-wrap">
              <h3 className="flex-shrink-0 text-lg font-semibold">{audio.name}</h3>
              <div className="flex grow items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Chip size="sm" variant="flat" color="primary">
                    {audio.markerCount} markers
                  </Chip>
                  {audio.listenCounter !== undefined && audio.listenCounter > 0 && (
                    <Chip size="sm" variant="flat" color="secondary" startContent={<Headphones size={14} />}>
                      {audio.listenCounter} {audio.listenCounter === 1 ? 'listen' : 'listens'}
                    </Chip>
                  )}
                  <div className="flex items-center" title={audio.isPublic ? "Public" : "Private"}>
                    {audio.isPublic ? (
                      <Globe size={16} className="text-success" />
                    ) : (
                      <Lock size={16} className="text-warning" />
                    )}
                  </div>
                </div>
                <AudioActionsDropdown
                  audioId={audio.id}
                  onDeleteClick={handleDeleteClick}
                  isDeleteDisabled={deleteAudioMutation.isPending}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm text-default-500">
            <p className="break-words"><span className="font-medium">Original file name:</span> {audio.originalFileName}</p>
            <p><span className="font-medium">Uploaded:</span> {formatTimeAgo(new Date(audio.createdAt))}</p>
            {audio.lastListenAt && (
              <p><span className="font-medium">Last listened:</span> {formatTimeAgo(new Date(audio.lastListenAt))}</p>
            )}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Audio File</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this audio file? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={deleteAudioMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}