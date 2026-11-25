import { useTranslations } from "next-intl";
import { ActionLink } from "@/components/portal-ui";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="shell page-content not-found">
      <h1>{t("notFoundTitle")}</h1>
      <p>{t("notFoundBody")}</p>
      <ActionLink href="/" primary>{t("backHome")}</ActionLink>
    </div>
  );
}
