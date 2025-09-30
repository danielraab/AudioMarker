'use client';

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button, Input, Card, CardBody, CardHeader, Switch } from "@heroui/react";
import { api } from "~/trpc/react";
import { Play, Save } from "lucide-react";
import { UnsavedChangesModal } from "../UnsavedChangesModal";

interface EditAudioFormProps {
  audioId: string;
}

export function EditAudioForm({ audioId }: EditAudioFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [error, setError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Use suspense query to fetch audio details
  const [audio] = api.audio.getAudioById.useSuspenseQuery({ id: audioId });

  // Setup mutation for updating audio
  const updateAudio = api.audio.updateAudio.useMutation({
    onSuccess: () => {
      void utils.audio.getAudioById.invalidate({ id: audioId });
      setIsFormDirty(false);
      setPendingNavigation(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleFormChange = () => {
    setIsFormDirty(true);
  };

  const submitForm = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const isPublic = formData.get('isPublic') !== null;

    if (!name) {
      setError("Name is required");
      return;
    }

    updateAudio.mutate(
      { id: audioId, name, isPublic }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitForm(e.currentTarget);
  };

  const handleNavigationAttempt = (path: string) => {
    if (isFormDirty) {
      setPendingNavigation(path);
      setShowModal(true);
      return;
    }
    router.push(path);
  };

  return (
    <Card className="mx-auto">
      <CardHeader className="flex gap-3 justify-between">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Audio Settings - {audio.name}</p>
          <p className="text-small text-default-500">Update audio details</p>
        </div>
        <Button
          color="success"
          startContent={<Play size={16} />}
          onPress={() => {
            handleNavigationAttempt(`/audio/listen/${audio.id}`);
          }}>
          Preview
        </Button>
      </CardHeader>
      <CardBody>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            type="text"
            label="Audio Name"
            placeholder="Enter a name for your audio"
            defaultValue={audio.name}
            isRequired
            variant="bordered"
            labelPlacement="outside"
            onChange={handleFormChange}
            maxLength={100}
          />

          <Switch
            name="isPublic"
            defaultSelected={audio.isPublic}
            size="sm"
            color="primary"
            onChange={handleFormChange}
          >
            Make audio public
          </Switch>
          
          <div className="text-xs text-default-500">
            <p><strong>Original File:</strong> {audio.originalFileName}</p>
            <p suppressHydrationWarning={true}><strong>Uploaded:</strong> {new Date(audio.createdAt).toLocaleString()}</p>
            <p suppressHydrationWarning={true}><strong>Updated:</strong> {new Date(audio.updatedAt).toLocaleString()}</p>
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <div className="flex gap-2 justify-between">
            <Button
              color="default"
              variant="light"
              onPress={() => {
                handleNavigationAttempt('/');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              startContent={<Save size={16} />}
              isLoading={updateAudio.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardBody>
      <UnsavedChangesModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDiscard={() => {
          setShowModal(false);
          setIsFormDirty(false);
          if (pendingNavigation) {
            router.push(pendingNavigation);
          }
        }}
        onSave={() => {
          setShowModal(false);
          if (formRef.current) {
            submitForm(formRef.current);
          }
        }}
      />
    </Card>
  );
}