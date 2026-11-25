import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Wordmark() {
  const t = useTranslations("common");
  return (
    <Link className="wordmark" href="/" aria-label={t("brandHome")}>
      <span className="wordmark-symbol" aria-hidden="true">MFG</span>
      <span className="wordmark-name" aria-hidden="true">MOTORSPORT</span>
    </Link>
  );
}
