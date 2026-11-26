import { CalendarDays, Flag, MapPin, Route, UsersRound } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { championships, previewChampionship } from "@/lib/championship-data";
import type { Division } from "@/lib/competition";
import { circuitHref, driverHref, findCircuit, publicCircuits, publicDrivers } from "@/lib/public-information";
import { japanTime, raceHref } from "@/lib/race-schedule";
import { seriesHref } from "@/lib/series";
import { getUpcomingRace } from "@/lib/upcoming-race";
import { ActionLink, EmptyState, MediaSlot } from "./portal-ui";
import { RaceCountdown } from "./race-countdown";

export async function SeriesNextRace({ division }: { division: Division }) {
  const t = await getTranslations();
  const format = await getFormatter();
  const next = await getUpcomingRace(division);
  const href = seriesHref(division, "calendar");

  if (!next) return <div className="series-race-empty">
    <Flag size={32} strokeWidth={1.4} aria-hidden="true" />
    <p>{t("sections.calendar.empty")}</p>
    <ActionLink href={href}>{t("home.calendarLink")}</ActionLink>
  </div>;

  const { race, schedule } = next;
  return <article className="series-next-race">
    <MediaSlot variant="circuit" image={race.image} sizes="(max-width: 720px) 100vw, 52vw" />
    <div className="series-race-copy">
      <p className="series-kicker"><Flag size={16} aria-hidden="true" />{t("schedule.round", { round: race.round })}</p>
      <h3>{race.title}</h3>
      {race.location && <p><MapPin size={17} aria-hidden="true" />{race.location}</p>}
      <p><CalendarDays size={17} aria-hidden="true" /><time dateTime={schedule.startAt}>
        {format.dateTime(new Date(schedule.startAt), { dateStyle: "long", timeStyle: "short", timeZone: japanTime })} · JST
      </time></p>
      <RaceCountdown date={schedule.startAt} />
      <ActionLink href={raceHref(race.id, new URLSearchParams({ series: division }))} primary>{t("schedule.details")}</ActionLink>
    </div>
  </article>;
}

export async function SeriesDrivers({ division, locale, seasonId }: { division: Division; locale: Locale; seasonId?: string }) {
  const t = await getTranslations();
  const drivers = publicDrivers().filter((driver) => driver.division === division && (!seasonId || driver.seasons.includes(seasonId)));
  if (!drivers.length) return <EmptyState icon={UsersRound}>{t("sections.drivers.empty")}</EmptyState>;

  const country = new Intl.DisplayNames(locale, { type: "region" });
  const hasPublishedSeason = seasonId && championships.some((season) => season.division === division && season.seasonId === seasonId);
  const positions = new Map(hasPublishedSeason ? previewChampionship(division, seasonId).map(({ number, position }) => [number, position]) : []);
  return <div className="series-card-grid">
    {drivers.slice(0, 3).map((driver) => {
      const nationality = driver.countryCode && /^[A-Z]{2}$/.test(driver.countryCode) ? country.of(driver.countryCode) : undefined;
      const vehicle = [driver.manufacturer, driver.model].filter(Boolean).join(" ");
      const position = positions.get(driver.number);
      return <article className="series-driver-card" key={driver.slug}>
        <div className="series-driver-image">
          <MediaSlot variant="editorial" image={driver.photograph} sizes="(max-width: 620px) 100vw, 33vw" />
          <span className="series-bib">#{driver.number}</span>
          {position !== undefined && <span className="series-position">{t("information.finish", { position })}</span>}
        </div>
        <div className="series-card-copy">
          <h3><Link href={driverHref(driver.slug)}>{driver.name}</Link></h3>
          {nationality && <p>{nationality}</p>}
          {vehicle && <p>{vehicle}</p>}
          <Link className="text-link" href={driverHref(driver.slug)}>{t("information.profile")}</Link>
        </div>
      </article>;
    })}
  </div>;
}

export async function SeriesCircuits({ division }: { division: Division }) {
  const t = await getTranslations("information");
  const format = await getFormatter();
  const circuits = publicCircuits().filter((circuit) => circuit.divisions.includes(division));
  if (!circuits.length) return <EmptyState icon={Route}>{t("circuitsEmpty")}</EmptyState>;

  return <div className="series-card-grid series-circuit-grid">
    {circuits.slice(0, 3).map((circuit) => {
      const layout = findCircuit(circuit.slug)?.layout;
      return <article className="series-circuit-card" key={circuit.slug}>
        <MediaSlot variant="circuit" image={circuit.image} sizes="(max-width: 620px) 100vw, 33vw" />
        <div className="series-card-copy">
          <h3><Link href={circuitHref(circuit.slug)}>{circuit.name}</Link></h3>
          {circuit.location && <p>{circuit.location}</p>}
          {layout && <p>{layout}</p>}
          {circuit.lengthKm !== undefined && <p>{format.number(circuit.lengthKm, { style: "unit", unit: "kilometer" })}</p>}
          <Link className="text-link" href={circuitHref(circuit.slug)}>{t("circuitDetails")}</Link>
        </div>
      </article>;
    })}
  </div>;
}
