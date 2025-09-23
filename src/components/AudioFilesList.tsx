'use client';

import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Chip, 
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { api } from "~/trpc/react";

export default function AudioFilesList() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAudioId, setSelectedAudioId] = React.useState<string>("");

  const {
    data: audios,
    isLoading,
    error,
    refetch
  } = api.audio.getUserAudios.useQuery();

  const deleteAudioMutation = api.audio.deleteAudio.useMutation({
    onSuccess: () => {
      refetch();
      onClose();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleDeleteClick = (audioId: string) => {
    setSelectedAudioId(audioId);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedAudioId) {
      deleteAudioMutation.mutate({ id: selectedAudioId });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading your audio files...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardBody className="flex items-center justify-center py-8">
          <p className="text-danger">Error loading audio files: {error.message}</p>
        </CardBody>
      </Card>
    );
  }

  if (!audios || audios.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Your Audio Files</p>
            <p className="text-small text-default-500">Manage your uploaded audio files</p>
          </div>
        </CardHeader>
        <CardBody className="flex items-center justify-center py-8">
          <p className="text-default-500">No audio files uploaded yet. Upload your first audio file above!</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Your Audio Files</p>
            <p className="text-small text-default-500">Manage your uploaded audio files ({audios.length})</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {audios.map((audio) => (
              <Card key={audio.id} className="shadow-sm">
                <CardBody>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{audio.name}</h3>
                        <Chip size="sm" color="primary" variant="flat">
                          MP3
                        </Chip>
                      </div>
                      <div className="space-y-1 text-sm text-default-500">
                        <p><span className="font-medium">Original file name:</span> {audio.originalFileName}</p>
                        <p><span className="font-medium">Uploaded:</span> {formatTimeAgo(new Date(audio.createdAt))}</p>

                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDeleteClick(audio.id)}
                        isDisabled={deleteAudioMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
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