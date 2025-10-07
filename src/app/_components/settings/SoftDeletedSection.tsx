"use client";

import { api } from "~/trpc/react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Info } from "lucide-react";

export default function SoftDeletedSection() {
  const {
    data: audios,
    isLoading: audiosLoading,
    refetch: refetchAudios,
  } = api.admin.getSoftDeletedAudios.useQuery();

  const {
    data: playlists,
    isLoading: playlistsLoading,
    refetch: refetchPlaylists,
  } = api.admin.getSoftDeletedPlaylists.useQuery();

  const recoverAudioMutation = api.admin.recoverAudio.useMutation({
    onSuccess: () => {
      void refetchAudios();
    },
  });

  const deleteAudioMutation = api.admin.permanentlyDeleteAudio.useMutation({
    onSuccess: () => {
      void refetchAudios();
    },
  });

  const recoverPlaylistMutation = api.admin.recoverPlaylist.useMutation({
    onSuccess: () => {
      void refetchPlaylists();
    },
  });

  const deletePlaylistMutation = api.admin.permanentlyDeletePlaylist.useMutation({
    onSuccess: () => {
      void refetchPlaylists();
    },
  });

  const handleRecoverAudio = (id: string) => {
    recoverAudioMutation.mutate({ id });
  };

  const handleDeleteAudio = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this audio? This action cannot be undone.")) {
      deleteAudioMutation.mutate({ id });
    }
  };

  const handleRecoverPlaylist = (id: string) => {
    recoverPlaylistMutation.mutate({ id });
  };

  const handleDeletePlaylist = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this playlist? This action cannot be undone.")) {
      deletePlaylistMutation.mutate({ id });
    }
  };

  const isLoading = audiosLoading || playlistsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Soft Deleted Audios</h2>
        {!audios || audios.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-default-500">No soft deleted audios found.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {audios.map((audio) => (
              <Card key={audio.id}>
                <CardBody>
                  <div className="flex flex-wrap justify-center items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-50">
                      <div className="flex-1">
                        <h3 className="font-medium">{audio.name}</h3>
                        <p className="text-sm text-default-500">
                          by {audio.createdBy?.name ?? "Unknown"} •{" "}
                          Deleted on {audio.deletedAt ? new Date(audio.deletedAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                      <Popover placement="top">
                        <PopoverTrigger>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-default-400 hover:text-default-600"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-3">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-default-600">Original filename:</p>
                              <p className="font-mono text-xs text-default-800">{audio.originalFileName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-default-600">File path:</p>
                              <p className="font-mono text-xs text-default-800">{audio.filePath}</p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        color="success"
                        variant="bordered"
                        size="sm"
                        isLoading={recoverAudioMutation.isPending}
                        onClick={() => handleRecoverAudio(audio.id)}
                      >
                        Recover
                      </Button>
                      <Button
                        color="danger"
                        variant="bordered"
                        size="sm"
                        isLoading={deleteAudioMutation.isPending}
                        onClick={() => handleDeleteAudio(audio.id)}
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Soft Deleted Playlists</h2>
        {!playlists || playlists.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-default-500">No soft deleted playlists found.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <Card key={playlist.id}>
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{playlist.name}</h3>
                      <p className="text-sm text-default-500">
                        by {playlist.createdBy?.name ?? "Unknown"} •{" "}
                        Deleted on {playlist.deletedAt ? new Date(playlist.deletedAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        color="success"
                        variant="bordered"
                        size="sm"
                        isLoading={recoverPlaylistMutation.isPending}
                        onClick={() => handleRecoverPlaylist(playlist.id)}
                      >
                        Recover
                      </Button>
                      <Button
                        color="danger"
                        variant="bordered"
                        size="sm"
                        isLoading={deletePlaylistMutation.isPending}
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
