import { CalendarDays, ClipboardList, Flag, Gauge, ScrollText } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Division } from "@/lib/competition";
import { japanTime, raceHref } from "@/lib/race-schedule";
import { getUpcomingRace } from "@/lib/upcoming-race";
import { sections } from "@/lib/portal";
import { entryCatalog } from "@/lib/registration/catalog";
import { publicationKey, regulationHref } from "@/lib/registration/regulations";
import { seriesData, seriesHref } from "@/lib/series";
import { EditorialNews } from "./editorial-news";
import Carousel, { type CarouselSlide } from "./carousel";
import { ActionLink, EmptyState, MediaSlot, SectionHeading } from "./portal-ui";
import { SeriesIdentity } from "./series-identity";
import { SeriesProfiles } from "./series-profiles";
import { StandingsPreview } from "./standings-preview";
import "./series-page.css";

const sports = ["calendar", "standings", "results", "drivers", "circuits"] as const;

function SeriesSection({ title, id, link, children }: {
  title: string; id: string; link?: { label: string; href: string }; children: ReactNode;
}) {
  return (
    <section className="series-panel" id={id} aria-labelledby={`${id}-title`}>
      <SectionHeading id={`${id}-title`} link={link}>{title}</SectionHeading>
      {children}
    </section>
  );
}

export async function SeriesPage({ division, locale }: { division: Division; locale: Locale }) {
  const t = await getTranslations();
  const format = await getFormatter();
  const data = seriesData[division];
  const season = entryCatalog[locale][division].find(({ id }) => id === data.currentSeasonId);
  const next = await getUpcomingRace(division);
  const pending = t("seriesPage.pending");
  const status = t(`entry.openingStatus.${season?.status ?? "pending"}`);
  const categoryName = t(`divisions.${division}.title`);
  const rules = regulationHref(division);
  const slides: CarouselSlide[] = (["overview", "skill", "grid", "participation"] as const).map((id) => ({
    id, image: data.images[id],
    title: t(`seriesPage.${division}.slides.${id}.title`),
    description: t(`seriesPage.${division}.slides.${id}.description`),
  }));
  const facts = [
    ["division", data.number],
    ["rounds", data.rounds === undefined ? pending : format.number(data.rounds)],
    ["finalists", data.finalists === undefined ? pending : format.number(data.finalists)],
    ["power", data.powerLimitPs === undefined ? pending : `${format.number(data.powerLimitPs)} PS`],
    ["season", season?.label ?? pending],
    ["registration", status],
  ] as const;
  const links = [
    ...sports.map((key) => ({ href: seriesHref(division, key), title: t(key === "circuits" ? "information.circuits" : `sections.${key}.title`), Icon: sections[key].icon })),
    { href: rules, title: t("sections.regulations.title"), Icon: ScrollText },
    { href: "#series-entry", title: t("nav.registration"), Icon: ClipboardList },
  ];

  return (
    <div className="shell series-page" data-division={division}>
      <SeriesIdentity division={division} />
      <Carousel slides={slides} variant="series" label={t("seriesPage.carousel", { series: categoryName })} />

      <section className="series-intro" aria-labelledby="series-about">
        <div>
          <SectionHeading id="series-about">{t("seriesPage.about")}</SectionHeading>
          <p>{t(`seriesPage.${division}.introduction`)}</p>
        </div>
        <Gauge size={34} strokeWidth={1.35} aria-hidden="true" />
      </section>

      <dl className="series-facts" aria-label={t("seriesPage.factsLabel")}>
        {facts.map(([key, value]) => <div key={key}><dt>{t(`seriesPage.facts.${key}`)}</dt><dd>{value}</dd></div>)}
      </dl>

      <nav className="series-sports" aria-label={t("seriesPage.sports")}>
        {links.map(({ href, title, Icon }) => (
          <Link key={href} href={href}><Icon size={18} aria-hidden="true" /><span>{title}</span></Link>
        ))}
      </nav>

      <div className="series-content">
        <SeriesSection title={t("seriesPage.latestNews")} id="series-news"
          link={{ href: seriesHref(division, "news"), label: t("home.newsLink") }}>
          <EditorialNews division={division} preview compact />
        </SeriesSection>

        <SeriesSection title={t("seriesPage.nextRace")} id="series-race"
          link={{ href: seriesHref(division, "calendar"), label: t("home.calendarLink") }}>
          {next ? (
            <article className="series-next-race">
              <MediaSlot variant="circuit" image={next.race.image} />
              <div>
                <h3><Link className="text-link" href={raceHref(next.race.id)}>{next.race.title}</Link></h3>
                <time dateTime={next.schedule.startAt}>{format.dateTime(new Date(next.schedule.startAt), { dateStyle: "long", timeZone: japanTime })}</time>
              </div>
            </article>
          ) : <EmptyState icon={CalendarDays}>{t("sections.calendar.empty")}</EmptyState>}
        </SeriesSection>

        <SeriesSection title={t("seriesPage.featuredDrivers")} id="series-drivers"
          link={{ href: seriesHref(division, "drivers"), label: t("seriesPage.viewDrivers") }}>
          <SeriesProfiles division={division} />
        </SeriesSection>

        <SeriesSection title={t("seriesPage.championshipStandings")} id="series-standings"
          link={{ href: seriesHref(division, "standings"), label: t("home.standingsLink") }}>
          <StandingsPreview division={division} />
        </SeriesSection>

        <SeriesSection title={t("seriesPage.regulatoryInformation")} id="series-rules"
          link={{ href: rules, label: t("regulation.view") }}>
          <EmptyState icon={ScrollText}>
            {publicationKey(division, season) ? t("seriesPage.version", { version: season?.regulationVersion ?? "" })
              : t("entry.regulationsPending", { series: categoryName })}
          </EmptyState>
        </SeriesSection>
      </div>

      <SeriesSection title={t("nav.registration")} id="series-entry">
        <div className="series-entry-content">
          <EmptyState icon={Flag}>{t("seriesPage.entryStatus", { series: categoryName, status })}</EmptyState>
          <ActionLink href="/registration" primary>{t("seriesPage.openRegistration")}</ActionLink>
        </div>
      </SeriesSection>
    </div>
  );
}
