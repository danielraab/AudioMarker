"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import {
  Users,
  Music,
  ListMusic,
  Headphones,
  AlertTriangle,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";

const TIME_RANGE_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
  { value: "365", label: "1 year" },
];

export default function StatisticsSection() {
  const t = useTranslations("AdminStatistics");
  const [daysInactive, setDaysInactive] = useState(30);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = api.admin.statistics.getOverallStatistics.useQuery();

  const {
    data: inactiveAudios,
    isLoading: inactiveLoading,
    refetch: refetchInactive,
  } = api.admin.statistics.getInactiveAudios.useQuery({ daysInactive });

  const softDeleteMutation = api.admin.statistics.softDeleteAudio.useMutation({
    onSuccess: () => {
      void refetchInactive();
      void refetchStats();
    },
  });

  const handleSoftDelete = (id: string, name: string) => {
    if (confirm(t("inactiveAudios.confirmDelete", { name }))) {
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
                    <div>
                      <span className="font-medium">{audio.name}</span>
                      <p className="text-xs text-default-400">
                        {t("topAudios.createdBy")}{" "}
                        {audio.createdBy.name ?? audio.createdBy.email ?? t("topAudios.unknown")}
                      </p>
                    </div>
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

      {/* Inactive Audios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            <h3 className="text-lg font-semibold">{t("inactiveAudios.title")}</h3>
          </div>
          <Select
            size="sm"
            className="w-40"
            selectedKeys={[String(daysInactive)]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
              if (value) setDaysInactive(Number(value));
            }}
            aria-label={t("inactiveAudios.timeRange")}
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-default-500">
            {t("inactiveAudios.description", { days: daysInactive })}
          </p>

          {inactiveLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : inactiveAudios && inactiveAudios.length > 0 ? (
            <div className="space-y-2">
              <p className="mb-4 text-sm">
                {t("inactiveAudios.found", { count: inactiveAudios.length })}
              </p>
              {inactiveAudios.map((audio) => (
                <div
                  key={audio.id}
                  className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Music className="text-warning" size={20} />
                    <div>
                      <p className="font-medium">{audio.name}</p>
                      <p className="text-xs text-default-400">
                        {t("inactiveAudios.createdBy")}{" "}
                        {audio.createdBy.name ?? audio.createdBy.email ?? t("inactiveAudios.unknown")} •{" "}
                        {audio.totalListens > 0 ? (
                          <>
                            {t("inactiveAudios.lastListened", {
                              date: new Date(audio.lastListenedAt!).toLocaleDateString(),
                            })}
                          </>
                        ) : (
                          t("inactiveAudios.neverListened")
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat" color={audio.isPublic ? "success" : "default"}>
                      {audio.isPublic ? t("inactiveAudios.public") : t("inactiveAudios.private")}
                    </Chip>
                    <Chip size="sm" variant="flat" color="primary">
                      {t("inactiveAudios.listens", { count: audio.totalListens })}
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
                      {t("inactiveAudios.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Music className="mb-2 text-success" size={32} />
              <p className="text-success">{t("inactiveAudios.none", { days: daysInactive })}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
