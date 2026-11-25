import { useTranslations } from "next-intl";
import type { Division } from "@/lib/competition";
import { homeMedia } from "@/lib/home-media";
import { ActionLink, MediaSlot } from "./portal-ui";
import { SeriesIdentity } from "./series-identity";

export function DivisionCard({ slug }: { slug: Division }) {
  const t = useTranslations();
  return (
    <article data-division={slug} className="front-series-card">
      <MediaSlot variant={slug === "super-series" ? "super" : "freshman"}
        image={homeMedia[slug]} sizes="(max-width: 640px) 100vw, 50vw" />
      <div className="front-series-body">
        <SeriesIdentity division={slug} as="h3" />
        <p>{t(`seriesPage.${slug}.introduction`)}</p>
        <ActionLink href={`/${slug}`}>{t("front.explore")}</ActionLink>
      </div>
    </article>
  );
}
