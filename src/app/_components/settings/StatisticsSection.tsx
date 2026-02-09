"use client";

import { api } from "~/trpc/react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import OverviewStatsCards from "./statistics/OverviewStatsCards";
import TopAudiosCard from "./statistics/TopAudiosCard";
import ListenTrendsCard from "./statistics/ListenTrendsCard";
import InactiveAudiosCard from "./statistics/InactiveAudiosCard";

export default function StatisticsSection() {
  const t = useTranslations("AdminStatistics");

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = api.admin.statistics.getOverallStatistics.useQuery();

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
      <OverviewStatsCards stats={stats} />
      <TopAudiosCard topAudios={stats.topAudios} />
      <ListenTrendsCard />
      <InactiveAudiosCard onDelete={() => void refetchStats()} />
    </div>
  );
}
