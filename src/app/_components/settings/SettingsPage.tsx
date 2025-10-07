"use client";

import { Tabs, Tab } from "@heroui/tabs";
import UserListSection from "./UserListSection";
import GeneralSettingsSection from "./GeneralSettingsSection";
import SoftDeletedSection from "./SoftDeletedSection";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="mt-2 text-default-500">Manage users and system settings</p>
      </div>

      <Tabs aria-label="Settings sections" variant="underlined">
        <Tab key="users" title="Users">
          <div className="py-4">
            <UserListSection />
          </div>
        </Tab>
        <Tab key="softDeleted" title="Soft Deleted">
          <div className="py-4">
            <SoftDeletedSection />
          </div>
        </Tab>
        <Tab key="system" title="System" isDisabled>
          <div className="py-4">
            <p className="text-default-500">System settings coming soon...</p>
          </div>
        </Tab>
        <Tab key="general" title="General">
          <div className="py-4">
            <GeneralSettingsSection />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}