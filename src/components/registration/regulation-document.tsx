"use client";

import { ArrowLeft, ArrowRight, FileText, LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { isPublished, type Category, type EntryDocument, type EntrySeason } from "@/lib/registration/catalog";
import { publicationKey } from "@/lib/registration/regulations";
import { useRegistrationDraft } from "./draft-provider";

const articles = ["general", "sporting", "technical", "requirements", "numbers", "sanctions", "terms"] as const;
type Article = (typeof articles)[number];

function articleContent(article: Article, season?: EntrySeason): { paragraphs?: readonly string[]; document?: EntryDocument } {
  if (!season) return {};
  switch (article) {
    case "general": return { paragraphs: season.generalProvisions };
    case "requirements": return { paragraphs: season.requirements };
    case "numbers": return { paragraphs: season.numbering ? [season.numbering.description] : undefined };
    case "sanctions": return { paragraphs: season.sanctions };
    default: return { document: season.documents[article] };
  }
}

function RulesText({ paragraphs, document }: { paragraphs?: readonly string[]; document?: EntryDocument }) {
  const t = useTranslations("regulation");
  const published = isPublished(document) ? document : undefined;
  const text = published?.paragraphs ?? paragraphs;
  return (
    <>
      {text?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {published?.href && <a className="text-link" href={published.href} target="_blank" rel="noopener noreferrer">
        {t("openDocument")}
      </a>}
      {!text?.length && !published?.href && <p className="regulation-pending">{t("contentPending")}</p>}
    </>
  );
}

function Acceptance({ category, series, season, versionKey }: {
  category: Category; series: string; season?: EntrySeason; versionKey?: string;
}) {
  const t = useTranslations("regulation");
  const router = useRouter();
  const { recordAcceptance, cancelReview } = useRegistrationDraft();
  const [accepted, setAccepted] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [stale, setStale] = useState(false);
  const ready = Boolean(season && versionKey);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!season || !versionKey || !accepted || !privacy) return;
    if (recordAcceptance(category, season, versionKey)) {
      router.push("/registration");
    } else {
      setStale(true);
    }
  }

  return (
    <section className="portal-panel regulation-acceptance" id="acceptance" aria-labelledby="regulation-acceptance-title">
      <h2 id="regulation-acceptance-title">{t("acceptanceTitle")}</h2>
      {!ready && <p className="regulation-notice"><LockKeyhole size={17} aria-hidden="true" />{t("unpublished")}</p>}
      {stale && <p role="alert" className="regulation-notice">{t("stale")}</p>}
      <form onSubmit={submit}>
        <label><input type="checkbox" checked={accepted} disabled={!ready} required
          onChange={(event) => setAccepted(event.target.checked)} />{t("declaration", { series })}</label>
        <label><input type="checkbox" checked={privacy} disabled={!ready} required
          onChange={(event) => setPrivacy(event.target.checked)} />{t("privacyConsent")}</label>
        <div className="form-actions">
          <button className="action action-primary" type="submit" disabled={!ready || !accepted || !privacy}>
            {t("acceptReturn")}
          </button>
          <Link className="action" href="/registration" onNavigate={cancelReview}>{t("backToEntry")}</Link>
        </div>
      </form>
    </section>
  );
}

export function RegulationDocument({ category, fromRegistration }: { category: Category; fromRegistration: boolean }) {
  const t = useTranslations();
  const { catalog, intent } = useRegistrationDraft();
  const series = t(`divisions.${category}.title`);
  const seasons = catalog[category];
  const reviewing = fromRegistration && intent?.category === category;
  const season = reviewing ? seasons.find(({ id }) => id === intent.seasonId)
    : seasons.find((candidate) => publicationKey(category, candidate)) ?? seasons[0];
  const versionKey = publicationKey(category, season);

  return (
    <div className="shell page-content regulation-layout" data-division={category}>
      <aside className="portal-panel regulation-index">
        <Link className="text-link" href="/regulations">{t("regulation.directory")}</Link>
        <nav aria-labelledby="regulation-index-title">
          <h2 id="regulation-index-title">{t("regulation.contents")}</h2>
          <ol>{articles.map((article, index) => (
            <li key={article}><a href={`#${article}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{t(`regulation.articles.${article}`)}
            </a></li>
          ))}</ol>
          {reviewing && <a className="text-link" href="#acceptance">{t("regulation.acceptanceTitle")}</a>}
        </nav>
      </aside>
      <div className="regulation-body">
        <div className="portal-panel regulation-metadata">
          <FileText size={25} aria-hidden="true" />
          <dl>
            <div><dt>{t("entry.fields.category")}</dt><dd>MFG {series}</dd></div>
            <div><dt>{t("entry.fields.seasonId")}</dt><dd>{season?.label ?? t("regulation.pending")}</dd></div>
            <div><dt>{t("regulation.version")}</dt><dd>{season?.regulationVersion ?? t("regulation.pending")}</dd></div>
          </dl>
        </div>
        {articles.map((article, index) => (
          <section key={article} id={article} className="portal-panel regulation-article" aria-labelledby={`${article}-title`}>
            <h2 id={`${article}-title`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {t(`regulation.articles.${article}`)}
            </h2>
            <RulesText {...articleContent(article, season)} />
            {article === "terms" && (
              <>
                <h3>{t("entry.documents.privacy")}</h3>
                <RulesText document={season?.documents.privacy} />
              </>
            )}
            <nav className="regulation-article-nav" aria-label={t("regulation.articleNavigation")}>
              {index > 0 && <a href={`#${articles[index - 1]}`}><ArrowLeft size={15} aria-hidden="true" />
                {t(`regulation.articles.${articles[index - 1]}`)}</a>}
              {index < articles.length - 1 && <a href={`#${articles[index + 1]}`}>
                {t(`regulation.articles.${articles[index + 1]}`)}<ArrowRight size={15} aria-hidden="true" /></a>}
            </nav>
          </section>
        ))}
        {reviewing && <Acceptance key={versionKey ?? `${category}:${intent.seasonId}`}
          category={category} series={series} season={season} versionKey={versionKey} />}
      </div>
    </div>
  );
}
