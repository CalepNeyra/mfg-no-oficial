"use client";

import { useTranslations } from "next-intl";
import { ActionLink } from "@/components/portal-ui";

export default function PageError({ reset }: { reset: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="shell page-content not-found">
      <h1>{t("errorTitle")}</h1>
      <p>{t("errorBody")}</p>
      <div className="flex flex-wrap gap-3">
        <button className="action action-primary" type="button" onClick={reset}>{t("retry")}</button>
        <ActionLink href="/">{t("backHome")}</ActionLink>
      </div>
    </div>
  );
}
