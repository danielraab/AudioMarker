'use client';

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody } from "@heroui/react";
import { Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";

interface AudioListItemProps {
  audio: {
    id: string;
    name: string;
    originalFileName: string;
    readonlyToken: string;
    createdAt: Date;
  };
}

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

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
          <div className="flex flex-row justify-between items-center gap-2">
            <h3 className="text-lg font-semibold">{audio.name}</h3>
            <div className="flex items-center gap-2">
              <Link href={`/listen/${audio.readonlyToken}`}>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Play size={16} />}
                >
                  Play
                </Button>
              </Link>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={handleDeleteClick}
                isDisabled={deleteAudioMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
          <div className="space-y-1 text-sm text-default-500">
            <p><span className="font-medium">Original file name:</span> {audio.originalFileName}</p>
            <p><span className="font-medium">Uploaded:</span> {formatTimeAgo(new Date(audio.createdAt))}</p>
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