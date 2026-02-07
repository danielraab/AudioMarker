"use client";

import { Tabs, Tab } from "@heroui/tabs";
import UserListSection from "./UserListSection";
import GeneralSettingsSection from "./GeneralSettingsSection";
import SoftDeletedSection from "./SoftDeletedSection";
import LegalInformationSection from "./LegalInformationSection";
import StatisticsSection from "./StatisticsSection";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-default-500">{t('description')}</p>
      </div>

      <Tabs aria-label={t('tabs.ariaLabel')} variant="underlined">
        <Tab key="statistics" title={t('tabs.statistics')}>
          <div className="py-4">
            <StatisticsSection />
          </div>
        </Tab>
        <Tab key="users" title={t('tabs.users')}>
          <div className="py-4">
            <UserListSection />
          </div>
        </Tab>
        <Tab key="softDeleted" title={t('tabs.softDeleted')}>
          <div className="py-4">
            <SoftDeletedSection />
          </div>
        </Tab>
        <Tab key="legal" title="Legal Pages">
          <div className="py-4">
            <LegalInformationSection />
          </div>
        </Tab>
        <Tab key="system" title={t('tabs.system')} isDisabled>
          <div className="py-4">
            <p className="text-default-500">{t('comingSoon')}</p>
          </div>
        </Tab>
        <Tab key="general" title={t('tabs.general')}>
          <div className="py-4">
            <GeneralSettingsSection />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}