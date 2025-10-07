"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { api } from "~/trpc/react";

export default function GeneralSettingsSection() {
  const { data: settings, isLoading } = api.admin.getRegistrationStatus.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-default-500">Loading settings...</div>
      </div>
    );
  }

  const registrationEnabled = settings?.registrationEnabled ?? true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Authentication Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium">Email Registration</h4>
              <p className="text-sm text-default-500">
                New user registration via email (Nodemailer) is currently{" "}
                {registrationEnabled ? "enabled" : "disabled"}.
              </p>
              <p className="text-xs text-default-400 mt-2">
                This setting is configured via the MAIL_REGISTRATION_ENABLED environment variable.
                Contact your system administrator to change this setting.
              </p>
            </div>
            <Chip
              color={registrationEnabled ? "success" : "default"}
              variant="flat"
            >
              {registrationEnabled ? "Enabled" : "Disabled"}
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}