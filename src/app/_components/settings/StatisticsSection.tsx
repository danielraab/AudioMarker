"use client";

import { api } from "~/trpc/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import {
  Users,
  Music,
  ListMusic,
  Headphones,
  HardDrive,
  AlertTriangle,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function StatisticsSection() {
  const t = useTranslations("AdminStatistics");

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = api.admin.statistics.getOverallStatistics.useQuery();

  const {
    data: unusedAudios,
    isLoading: unusedLoading,
    refetch: refetchUnused,
  } = api.admin.statistics.getUnusedAudios.useQuery();

  const softDeleteMutation = api.admin.statistics.softDeleteAudio.useMutation({
    onSuccess: () => {
      void refetchUnused();
      void refetchStats();
    },
  });

  const handleSoftDelete = (id: string, name: string) => {
    if (confirm(t("unusedAudios.confirmDelete", { name }))) {
      softDeleteMutation.mutate({ id });
    }
  };

  if (statsLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner size="lg" label={t("loading")} />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">{t("error")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">{t("stats.users")}</p>
              <p className="text-2xl font-bold">{stats.users.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-success/10 p-3">
              <Music className="text-success" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">{t("stats.audios")}</p>
              <p className="text-2xl font-bold">{stats.audios.active}</p>
              <p className="text-xs text-default-400">
                {t("stats.publicCount", { count: stats.audios.public })}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-secondary/10 p-3">
              <ListMusic className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">{t("stats.playlists")}</p>
              <p className="text-2xl font-bold">{stats.playlists.active}</p>
              <p className="text-xs text-default-400">
                {t("stats.publicCount", { count: stats.playlists.public })}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-warning/10 p-3">
              <Headphones className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-sm text-default-500">{t("stats.totalListens")}</p>
              <p className="text-2xl font-bold">{stats.listens.totalAudioListens}</p>
              <p className="text-xs text-default-400">
                {t("stats.recentListens", { count: stats.listens.recentAudioListens })}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Storage Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <HardDrive size={20} />
          <h3 className="text-lg font-semibold">{t("storage.title")}</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-default-500">{t("storage.totalFiles")}</p>
              <p className="text-xl font-semibold">{stats.storage.totalFiles}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">{t("storage.totalSize")}</p>
              <p className="text-xl font-semibold">{formatBytes(stats.storage.totalSizeBytes)}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">{t("storage.deletedAudios")}</p>
              <p className="text-xl font-semibold">{stats.audios.deleted}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top Audios */}
      {stats.topAudios.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp size={20} />
            <h3 className="text-lg font-semibold">{t("topAudios.title")}</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {stats.topAudios.map((audio, index) => (
                <div
                  key={audio.id}
                  className="flex items-center justify-between rounded-lg bg-default-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{audio.name}</span>
                  </div>
                  <Chip size="sm" variant="flat" color="primary">
                    {t("topAudios.listens", { count: audio.listens })}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Unused Audios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            <h3 className="text-lg font-semibold">{t("unusedAudios.title")}</h3>
          </div>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-default-500">{t("unusedAudios.description")}</p>

          {unusedLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : unusedAudios && unusedAudios.length > 0 ? (
            <div className="space-y-2">
              <p className="mb-4 text-sm">
                {t("unusedAudios.found", { count: unusedAudios.length })}
              </p>
              {unusedAudios.map((audio) => (
                <div
                  key={audio.id}
                  className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Music className="text-warning" size={20} />
                    <div>
                      <p className="font-medium">{audio.name}</p>
                      <p className="text-xs text-default-400">
                        {audio.originalFileName} • {t("unusedAudios.createdBy")}{" "}
                        {audio.createdBy.name ?? audio.createdBy.email ?? t("unusedAudios.unknown")} •{" "}
                        {new Date(audio.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat" color={audio.isPublic ? "success" : "default"}>
                      {audio.isPublic ? t("unusedAudios.public") : t("unusedAudios.private")}
                    </Chip>
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      startContent={<Trash2 size={14} />}
                      onPress={() => handleSoftDelete(audio.id, audio.name)}
                      isLoading={
                        softDeleteMutation.isPending &&
                        softDeleteMutation.variables?.id === audio.id
                      }
                    >
                      {t("unusedAudios.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Music className="mb-2 text-success" size={32} />
              <p className="text-success">{t("unusedAudios.none")}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
