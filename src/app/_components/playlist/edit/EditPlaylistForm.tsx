'use client';

import { Button, Card, CardBody, CardHeader, Input, Switch } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "~/trpc/react";
import { UnsavedChangesModal } from "../../UnsavedChangesModal";
import { Play, Save } from "lucide-react";


interface EditPlaylistFormProps {
  playlistId: string;
}

export default function EditPlaylistForm({ playlistId }: EditPlaylistFormProps) {
  const router = useRouter();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const utils = api.useUtils();

  const [playlist] = api.playlist.getPlaylistById.useSuspenseQuery({
    id: playlistId,
  });


  const updatePlaylistMutation = api.playlist.updatePlaylist.useMutation({
    onSuccess: () => {
      void utils.playlist.getPlaylistById.invalidate({ id: playlistId });
      setIsFormDirty(false);
      setPendingNavigation(null);
    },
    onError: (error) => {
      console.error("Update playlist error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitForm(e.currentTarget);
  };

  const submitForm = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const name = (formData.get('name') as string).trim();
    const isPublic = formData.get('isPublic') !== null;

    if (!name) {
      setError("Name is required");
      return;
    }

    updatePlaylistMutation.mutate(
      { id: playlistId, name: name, isPublic },
    );
  };

  const handleFormChange = () => {
    setIsFormDirty(true);
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
    <Card>
      <CardHeader className="flex gap-3 justify-between">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Playlist Settings - {playlist.name}</p>
          <p className="text-small text-default-500">Update playlist details</p>
        </div>
        <Button
          color="success"
          startContent={<Play size={16} />}
          >
          Preview TODO
        </Button>
      </CardHeader>
      <CardBody>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            type="text"
            label="Playlist Name"
            placeholder="Enter playlist name"
            defaultValue={playlist.name}
            onChange={handleFormChange}
            isRequired
            variant="bordered"
            labelPlacement="outside"
            maxLength={100}
          />

          <Switch
            name="isPublic"
            defaultSelected={playlist.isPublic}
            size="sm"
            color="primary"
            onChange={handleFormChange}
          >
            Make playlist public
          </Switch>
          
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
              isLoading={updatePlaylistMutation.isPending}
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