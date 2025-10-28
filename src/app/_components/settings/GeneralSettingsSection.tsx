"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";

export default function GeneralSettingsSection() {
  const t = useTranslations('GeneralSettings');
  const { data: settings, isLoading } = api.admin.systemSettings.getRegistrationStatus.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner size="lg" label={t('loading')} />
          </div>
        </CardBody>
      </Card>
    );
  }

  const registrationEnabled = settings?.registrationEnabled ?? true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{t('title')}</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">{t('emailRegistration.title')}</h4>
              <p className="text-sm text-default-500">
                {t('emailRegistration.description', { status: registrationEnabled ? t('status.enabled') : t('status.disabled') })}
              </p>
              <p className="text-xs text-default-400 mt-2">
                {t('emailRegistration.note')}
              </p>
            </div>
            <Chip
              color={registrationEnabled ? "success" : "default"}
              variant="flat"
            >
              {registrationEnabled ? t('status.enabled') : t('status.disabled')}
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}