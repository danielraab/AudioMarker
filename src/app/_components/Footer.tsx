import React from "react";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  // Get version from environment (git tag, git describe, or commit hash)
  const displayVersion = process.env.NEXT_PUBLIC_GIT_VERSION_LABEL ?? "dev";
  const t = await getTranslations("Footer");
  
  return (
    <footer className="mt-10 w-full flex flex-col items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row">
      <div className="flex items-center gap-2">
        <span>© {new Date().getFullYear()}</span>
        <span className="font-semibold">draab</span>
      </div>
      <span className="font-mono text-xs" title={t("versionTitle", { version: displayVersion })}>
        {displayVersion}
      </span>
      <span className="text-xs">{t("cookiesNote")}</span>
    </footer>
  );
}