'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader, Checkbox } from "@heroui/react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { Play } from "lucide-react";

interface EditAudioFormProps {
  audioId: string;
}

export function EditAudioForm({ audioId }: EditAudioFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [error, setError] = useState<string | null>(null);

  // Use suspense query to fetch audio details
  const [audio] = api.audio.getAudioById.useSuspenseQuery({ id: audioId });

  // Setup mutation for updating audio
  const updateAudio = api.audio.updateAudio.useMutation({
    onSuccess: async () => {
      await utils.audio.invalidate();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const isPublic = formData.get('isPublic') !== null;

    if (!name) {
      setError("Name is required");
      return;
    }

    updateAudio.mutate({ id: audioId, name, isPublic });
  };

  return (
    <Card className="mx-auto">
      <CardHeader className="flex gap-3 justify-between">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Edit Audio - {audio.name}</p>
          <p className="text-small text-default-500">Update audio details</p>
        </div>
        <Button
          as={Link}
          color="success"
          startContent={<Play size={16} />}
          href={`/listen/${audio.readonlyToken}`}>
          test
        </Button>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            type="text"
            label="Audio Name"
            placeholder="Enter a name for your audio"
            defaultValue={audio.name}
            isRequired
            variant="bordered"
            labelPlacement="outside"
          />

          <Checkbox
            name="isPublic"
            defaultSelected={audio.isPublic}
            size="sm"
            color="primary"
          >
            publicly accessible
          </Checkbox>
          
          <div className="text-xs text-default-500">
            <p><strong>Original File:</strong> {audio.originalFileName}</p>
            <p suppressHydrationWarning={true}><strong>Uploaded:</strong> {new Date(audio.createdAt).toLocaleString()}</p>
            <p suppressHydrationWarning={true}><strong>Updated:</strong> {new Date(audio.updatedAt).toLocaleString()}</p>
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              color="default"
              variant="light"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={updateAudio.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}