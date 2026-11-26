import Image from "next/image";
import { CalendarDays, Clapperboard, Flag, Handshake, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { gallery, partners } from "@/lib/competition";
import { homeMedia } from "@/lib/home-media";
import { divisionSlugs, sections } from "@/lib/portal";
import { entryCatalog } from "@/lib/registration/catalog";
import { raceHref } from "@/lib/race-schedule";
import { newestResultEvents, podiumEntries, resultsHref } from "@/lib/race-results";
import { publicResultsData } from "@/lib/race-results-data";
import { driverHref, publicDrivers } from "@/lib/public-information";
import { regulationHref } from "@/lib/registration/regulations";
import { seriesData } from "@/lib/series";
import { getUpcomingRace } from "@/lib/upcoming-race";
import { ActionLink, EmptyState, MediaSlot, SectionHeading } from "./portal-ui";
import { RaceCountdown } from "./race-countdown";
import { SportTime } from "./sport-time";

export function HomeSection({ id, title, link, children, tone }: {
  id: string; title: string; link?: { href: string; label: string }; children: ReactNode; tone?: "paper";
}) {
  return (
    <section className="front-band" id={id} data-tone={tone} aria-labelledby={`${id}-title`}>
      <div className="shell">
        <SectionHeading id={`${id}-title`} link={link}>{title}</SectionHeading>
        {children}
      </div>
    </section>
  );
}

export async function NextRace() {
  const t = await getTranslations();
  const next = await getUpcomingRace();
  const race = next?.race;

  return (
    <section className="front-next" aria-labelledby="next-race-title">
      <div className="shell front-next-inner">
        <CalendarDays size={26} aria-hidden="true" />
        <div className="front-next-copy">
          <h2 id="next-race-title">{t("seriesPage.nextRace")}</h2>
          {race && next ? (
            <>
              <p className="front-race-meta">{t("calendar.round", { round: race.round, series: t(`divisions.${race.division}.title`) })}</p>
              <h3>{race.title}</h3>
              {race.location && <p><MapPin size={16} aria-hidden="true" />{race.location}</p>}
              <SportTime instant={next.schedule.startAt} />
              <RaceCountdown date={next.schedule.startAt} />
            </>
          ) : <p>{t("sections.calendar.empty")}</p>}
        </div>
        {race && <MediaSlot variant="circuit" image={race.image} />}
        <ActionLink href={race ? raceHref(race.id) : "/calendar"} primary={Boolean(race)}>
          {race ? t("front.eventDetails") : t("home.calendarLink")}
        </ActionLink>
      </div>
    </section>
  );
}

export async function HomeProfiles() {
  const t = await getTranslations();
  const records = publicDrivers();
  const featured = divisionSlugs.flatMap((division) => records.filter((driver) => driver.division === division).slice(0, 3));
  if (!featured.length) return <EmptyState icon={sections.drivers.icon}>{t("sections.drivers.empty")}</EmptyState>;

  return <div className="front-card-grid">
    {featured.map((driver) => <article key={driver.slug} className="front-profile" data-division={driver.division}>
      <div className="front-profile-visual">
        <MediaSlot variant="editorial" image={driver.photograph} sizes="(max-width: 640px) 100vw, 33vw" />
        <span className="front-number">{driver.number}</span>
      </div>
      <div className="front-profile-copy">
        <p className="overline">{t("divisions." + driver.division + ".title")}</p>
        <h3>{driver.name}</h3>
        {(driver.manufacturer || driver.model) && <p>{driver.manufacturer} {driver.model}</p>}
        <Link className="text-link" href={driverHref(driver.slug)}>{t("front.driverProfile")}</Link>
      </div>
    </article>)}
  </div>;
}

export async function HomeResults({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const latest = newestResultEvents(publicResultsData(locale).events).flatMap((race) => {
    const final = race.sessions.find((session) => session.kind === "final");
    const places = final ? podiumEntries(final.bulletin.entries, race.drivers) : [];
    return places.length ? [{ race, places }] : [];
  })[0];
  if (!latest) return <EmptyState icon={Flag}>{t("sections.results.empty")}</EmptyState>;
  const { race, places } = latest;

  return (
    <article className="front-result">
      <p className="overline">{t(`divisions.${race.division}.title`)}</p>
      <h3>{race.title}</h3>
      <ol className="front-podium">
        {places.map(({ position, driver }) => (
          <li key={position}><strong>{position}</strong><div><p>{driver.name}</p><p>{driver.vehicle.manufacturer} {driver.vehicle.model}</p></div></li>
        ))}
      </ol>
      <ActionLink href={resultsHref(race, "final")}>{t("sections.results.link")}</ActionLink>
    </article>
  );
}

export async function HomeRegistration({ locale }: { locale: Locale }) {
  const t = await getTranslations();

  return (
    <section className="front-registration" id="participation" aria-labelledby="participation-title">
      <MediaSlot variant="hero" image={homeMedia.registration} sizes="100vw" />
      <div className="shell front-registration-inner">
        <div>
          <h2 id="participation-title">{t("front.participation")}</h2>
          <div className="front-actions">
            <ActionLink href="/registration" primary>{t("entry.title")}</ActionLink>
            <ActionLink href="/regulations">{t("sections.regulations.title")}</ActionLink>
          </div>
        </div>
        <dl className="front-entry-status">
          {divisionSlugs.map((division) => {
            const catalog = entryCatalog[locale][division];
            const season = catalog.find(({ id }) => id === seriesData[division].currentSeasonId) ??
              catalog.find(({ status }) => status === "open") ?? (catalog.length === 1 ? catalog[0] : undefined);
            return (
              <div key={division}>
                <dt>{t(`divisions.${division}.title`)}</dt>
                <dd>
                  <span>{t(`entry.openingStatus.${season?.status ?? "pending"}`)}</span>
                  <Link href={`${regulationHref(division)}#requirements`}>{t("entry.requirementsTitle")}</Link>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

export async function HomeGallery() {
  const t = await getTranslations("front");
  if (!gallery.length) return <EmptyState icon={Clapperboard}>{t("galleryEmpty")}</EmptyState>;

  return (
    <div className="front-card-grid">
      {gallery.map(({ kind, title, image, video }) => (
        <figure className="front-profile" key={`${kind}-${title}`}>
          {video ? <video controls preload="metadata" poster={typeof image?.src === "string" ? image.src : undefined}
            aria-label={title} src={video} /> : <MediaSlot variant="editorial" image={image} />}
          <figcaption className="front-profile-copy"><p className="overline">{t(`mediaKind.${kind}`)}</p><strong>{title}</strong></figcaption>
        </figure>
      ))}
    </div>
  );
}

export async function HomePartners() {
  const t = await getTranslations("front");
  if (!partners.length) return <EmptyState icon={Handshake}>{t("partnersEmpty")}</EmptyState>;

  return (
    <ul className="front-partners">
      {partners.map(({ name, image, href }) => {
        const logo = <Image src={image.src} alt={name} width={160} height={72} />;
        return <li key={name}>{href ? <a href={href}>{logo}</a> : logo}</li>;
      })}
    </ul>
  );
}
