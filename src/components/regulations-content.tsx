import { ScrollText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { entryCatalog, categories, isPublished } from "@/lib/registration/catalog";
import { publicationKey, regulationHref } from "@/lib/registration/regulations";
import { ActionLink } from "./portal-ui";
import { SeriesIdentity } from "./series-identity";

export async function RegulationsContent() {
  const t = await getTranslations();
  const catalog = entryCatalog[await getLocale() as Locale];
  return <div className="info-editorial-grid">
    {categories.map((category) => {
      const seasons = catalog[category];
      const version = seasons.find((season) => publicationKey(category, season));
      const href = regulationHref(category);
      const documents = [
        { id: "sporting", title: t("entry.documents.sporting"), published: seasons.some((season) => isPublished(season.documents.sporting)) },
        { id: "technical", title: t("entry.documents.technical"), published: seasons.some((season) => isPublished(season.documents.technical)) },
        { id: "requirements", title: t("entry.requirementsTitle"), published: seasons.some((season) => season.requirements.length > 0) },
      ];
      return <section className="info-panel info-regulation" id={category} key={category} data-division={category}
        aria-label={t(`divisions.${category}.title`)}>
        <SeriesIdentity division={category} as="h3" />
        <p>{version ? version.label + " · " + t("entry.documents.revision", { revision: version.regulationVersion ?? "" })
          : t("information.documentsPending")}</p>
        <ul>
          {documents.map(({ id, title, published }) => <li key={id}>
            <ScrollText size={16} aria-hidden="true" />
            <Link className="text-link" href={href + "#" + id}>{title}</Link>
            {!published && <span>{t("championship.publication.pending")}</span>}
          </li>)}
          {(["conduct", "notices"] as const).map((id) => {
            const published = seasons.find((season) => season.publicDocuments?.[id]?.length)?.publicDocuments?.[id] ?? [];
            return <li key={id}>
              <ScrollText size={16} aria-hidden="true" /><strong>{t("information." + id)}</strong>
              {published.length ? <ul className="info-regulation-documents">{published.map(({ title, href }) => (
                <li key={href}><Link className="text-link" href={href}>{title}</Link></li>
              ))}</ul> : <span>{t("championship.publication.pending")}</span>}
            </li>;
          })}
        </ul>
        <ActionLink href={href}>{t("regulation.view")}</ActionLink>
      </section>;
    })}
  </div>;
}
