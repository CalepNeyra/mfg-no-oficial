import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function PageIntro({ title, description, category, media, division }: {
  title: string; description: string; category?: string; media?: ReactNode; division?: string;
}) {
  const t = useTranslations("common");
  return (
    <div className="subhero" data-division={division}>
      <div className="shell">
        <nav className="breadcrumb" aria-label={t("breadcrumb")}>
          <Link href="/">{t("home")}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <div className="subhero-inner">
          <div className="subhero-copy">
            {category && <p className="overline">{category}</p>}
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {media}
        </div>
      </div>
    </div>
  );
}
