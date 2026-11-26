import { Link } from "@/i18n/navigation";
import { Newspaper } from "lucide-react";
import { type Division, type NewsItem, news } from "@/lib/competition";
import { useTranslations } from "next-intl";
import { EmptyState, MediaSlot } from "./portal-ui";

function EditorialCard({ item, featured = false, summary = false }: {
  item: NewsItem; featured?: boolean; summary?: boolean;
}) {
  return (
    <article className={featured ? "editorial-card editorial-featured" : "editorial-card"}>
      <MediaSlot variant="editorial" image={item.image} />
      <div className="editorial-body">
        <div className="editorial-meta">
          <span className="overline">{item.category}</span>
          <time dateTime={item.date}>{item.dateLabel}</time>
        </div>
        <h3><Link href={item.href}>{item.title}</Link></h3>
        {summary && <p>{item.description}</p>}
      </div>
    </article>
  );
}

export function EditorialNews({ preview = false, division, compact = false, detailed = false }: {
  preview?: boolean; division?: Division; compact?: boolean; detailed?: boolean;
}) {
  const t = useTranslations("sections.news");
  const items = division ? news.filter((item) => item.division === division) : news;
  if (!items.length) return <EmptyState icon={Newspaper}>{t("empty")}</EmptyState>;

  const summary = detailed || (compact && !division);
  const ordered = summary ? [...items].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)) : items;
  const [featured, ...secondary] = preview ? ordered.slice(0, summary ? 4 : 3) : ordered;
  return (
    <div className="editorial-grid">
      <EditorialCard item={featured} featured summary={summary} />
      {secondary.length > 0 && <div className="editorial-secondary">
        {secondary.map((item) => <EditorialCard key={item.href} item={item} summary={summary} />)}
      </div>}
    </div>
  );
}
