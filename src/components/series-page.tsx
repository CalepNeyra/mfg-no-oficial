import { CalendarDays, ClipboardList, Flag, Gauge, ScrollText, Trophy } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { calendarSeasons, type Division } from "@/lib/competition";
import { sections } from "@/lib/portal";
import { entryCatalog } from "@/lib/registration/catalog";
import { publicationKey, regulationHref } from "@/lib/registration/regulations";
import { seriesData, seriesHref } from "@/lib/series";
import Carousel, { type CarouselSlide } from "./carousel";
import { EditorialNews } from "./editorial-news";
import { ActionLink, MediaSlot, SectionHeading } from "./portal-ui";
import { SeriesCircuits, SeriesDrivers, SeriesNextRace } from "./series-editorial";
import { SeriesIdentity } from "./series-identity";
import { StandingsPreview } from "./standings-preview";
import "./series-page.css";

const sports = ["calendar", "standings", "results", "drivers", "circuits"] as const;
const slidesOrder = ["overview", "skill", "grid", "participation"] as const;

function SeriesSection({ id, title, link, children, tone }: {
  id: string; title: string; link?: { href: string; label: string }; children: ReactNode; tone?: "dark" | "paper";
}) {
  return <section className="series-band" id={id} data-tone={tone} aria-labelledby={id + "-title"}>
    <div className="shell">
      <SectionHeading id={id + "-title"} link={link}>{title}</SectionHeading>
      {children}
    </div>
  </section>;
}

export async function SeriesPage({ division, locale }: { division: Division; locale: Locale }) {
  const t = await getTranslations();
  const format = await getFormatter();
  const data = seriesData[division];
  const catalog = entryCatalog[locale][division];
  const season = data.currentSeasonId ? catalog.find(({ id }) => id === data.currentSeasonId)
    : catalog.find(({ status }) => status === "open") ?? (catalog.length === 1 ? catalog[0] : undefined);
  const seasonLabel = season?.label ?? calendarSeasons.find(({ id }) => id === data.currentSeasonId)?.label;
  const status = season?.status ?? "pending";
  const categoryName = t(`divisions.${division}.title`);
  const rules = regulationHref(division);
  const registration = `/registration?series=${division}`;
  const slides: CarouselSlide[] = slidesOrder.map((id) => ({
    id, image: data.images[id],
    title: t(`seriesPage.${division}.slides.${id}.title`),
    description: t(`seriesPage.${division}.slides.${id}.description`),
  }));
  const primaryFacts = [
    { id: "season", value: seasonLabel, Icon: Flag },
    { id: "rounds", value: data.rounds === undefined ? undefined : format.number(data.rounds), Icon: CalendarDays },
    { id: "finalists", value: data.finalists === undefined ? undefined : format.number(data.finalists), Icon: Trophy },
    { id: "power", value: data.powerLimitPs === undefined ? undefined : format.number(data.powerLimitPs) + " PS", Icon: Gauge },
  ].filter(({ value }) => value !== undefined);
  const links = [
    ...sports.map((key) => ({ href: seriesHref(division, key), title: t(key === "circuits" ? "information.circuits" : `sections.${key}.title`), Icon: sections[key].icon })),
    { href: rules, title: t("sections.regulations.title"), Icon: ScrollText },
    { href: registration, title: t("nav.registration"), Icon: ClipboardList },
  ];

  return <div className="series-page" data-division={division}>
    <div className="series-masthead">
      <div className="shell"><SeriesIdentity division={division} /></div>
    </div>
    <div className="shell series-hero-shell">
      <Carousel slides={slides} variant="series" label={t("seriesPage.carousel", { series: categoryName })} />
    </div>

    <nav className="series-navigation" aria-label={t("seriesPage.sports")}>
      <div className="shell series-sports">
        <Link href={`/${division}`} aria-current="page">{t("seriesPage.overviewTab")}</Link>
        {links.map(({ href, title, Icon }) => <Link key={href} href={href}>
          <Icon size={17} aria-hidden="true" /><span>{title}</span>
        </Link>)}
      </div>
    </nav>

    <section className="series-band series-intro" aria-labelledby="series-about">
      <div className="shell">
        <div className="series-intro-grid">
          <div className="series-intro-copy">
            <SectionHeading id="series-about">{t("seriesPage.about")}</SectionHeading>
            <p>{t(`seriesPage.${division}.introduction`)}</p>
            <ul className="series-characteristics">
              <li><Gauge size={18} aria-hidden="true" />{slides[1].title}</li>
              <li><Flag size={18} aria-hidden="true" />{slides[2].title}</li>
            </ul>
          </div>
          <MediaSlot variant={division === "super-series" ? "super" : "freshman"}
            image={data.editorialImage ?? data.images.overview} sizes="(max-width: 720px) 100vw, 46vw" />
        </div>
        {primaryFacts.length > 0 && <dl className="series-facts" aria-label={t("seriesPage.factsLabel")}>
          {primaryFacts.map(({ id, value, Icon }) => <div key={id}>
            <Icon size={19} aria-hidden="true" /><dt>{t(`seriesPage.facts.${id}`)}</dt><dd>{value}</dd>
          </div>)}
        </dl>}
      </div>
    </section>

    <SeriesSection title={t("seriesPage.nextRace")} id="series-race" tone="dark">
      <SeriesNextRace division={division} />
    </SeriesSection>

    <SeriesSection title={t("seriesPage.latestNews")} id="series-news"
      link={{ href: seriesHref(division, "news"), label: t("home.newsLink") }}>
      <EditorialNews division={division} preview detailed />
    </SeriesSection>

    <SeriesSection title={t("seriesPage.championshipStandings")} id="series-standings" tone="paper"
      link={{ href: seriesHref(division, "standings"), label: t("home.standingsLink") }}>
      <StandingsPreview division={division} preview />
    </SeriesSection>

    <SeriesSection title={t("seriesPage.featuredDrivers")} id="series-drivers"
      link={{ href: seriesHref(division, "drivers"), label: t("seriesPage.viewDrivers") }}>
      <SeriesDrivers division={division} locale={locale} seasonId={data.currentSeasonId} />
    </SeriesSection>

    <SeriesSection title={t("information.circuits")} id="series-circuits" tone="paper"
      link={{ href: seriesHref(division, "circuits"), label: t("seriesPage.viewCircuits") }}>
      <SeriesCircuits division={division} />
    </SeriesSection>

    <SeriesSection title={t("seriesPage.regulatoryInformation")} id="series-rules">
      <div className="series-rules">
        <div>
          <p>{publicationKey(division, season)
            ? t("seriesPage.version", { version: season?.regulationVersion ?? "" })
            : t("entry.regulationsPending", { series: categoryName })}</p>
          <ActionLink href={rules}>{t("regulation.view")}</ActionLink>
        </div>
        <ul>
          <li><Link href={rules + "#sporting"}><ScrollText size={17} aria-hidden="true" />{t("entry.documents.sporting")}</Link></li>
          <li><Link href={rules + "#technical"}><Gauge size={17} aria-hidden="true" />{t("entry.documents.technical")}</Link></li>
        </ul>
      </div>
    </SeriesSection>

    <section className="series-participation" id="series-entry" aria-labelledby="series-entry-title">
      <div className="shell series-entry-grid">
        <div>
          <span className="series-entry-status" data-status={status}>{t(`entry.openingStatus.${status}`)}</span>
          <h2 id="series-entry-title">{t("nav.registration")}</h2>
          <p>{t("seriesPage.participationCopy")}</p>
        </div>
        <div className="series-entry-actions">
          <ActionLink href={rules + "#requirements"}>{t("entry.requirementsTitle")}</ActionLink>
          <ActionLink href={rules}>{t("regulation.view")}</ActionLink>
          <ActionLink href={registration} primary>{t("seriesPage.openRegistration")}</ActionLink>
        </div>
      </div>
    </section>
  </div>;
}
