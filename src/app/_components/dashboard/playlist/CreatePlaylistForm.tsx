'use client';

import { useState } from "react";
import { Button, Input, Switch, Card, CardBody, CardHeader } from "@heroui/react";
import { ListMusic, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function CreatePlaylistForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const createPlaylistMutation = api.playlist.createPlaylist.useMutation({
    onSuccess: () => {
      setName("");
      setIsPublic(false);
      setIsExpanded(false);
      router.refresh();
    },
    onError: (error) => {
      console.error("Create playlist error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createPlaylistMutation.mutate({
        name: name.trim(),
        isPublic,
      });
    }
  };

  const handleCancel = () => {
    setName("");
    setIsPublic(false);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => setIsExpanded(true)}
        >
          Create New Playlist <ListMusic />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Create New Playlist</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Playlist Name"
              placeholder="Enter playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
              maxLength={100}
              description="Give your playlist a descriptive name"
              autoFocus
            />
            
            <div className="flex items-center gap-2">
              <Switch
                isSelected={isPublic}
                onValueChange={setIsPublic}
                size="sm"
              >
                Make playlist public
              </Switch>
            </div>
            
            <div className="flex justify-betweens gap-2">
              <Button
                type="button"
                variant="light"
                onPress={handleCancel}
                isDisabled={createPlaylistMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={createPlaylistMutation.isPending}
                isDisabled={!name.trim()}
              >
                Create Playlist
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}