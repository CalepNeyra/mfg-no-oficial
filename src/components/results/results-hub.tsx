"use client";

import { CalendarDays, ChevronRight, Flag, MapPin, Route, Timer, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";
import { divisionSlugs } from "@/lib/portal";
import { newestResultEvents, resultsHref, type PublishedSession, type ResultEvent, type ResultsSeason } from "@/lib/race-results";
import { raceHref } from "@/lib/race-schedule";
import { regulationHref } from "@/lib/registration/regulations";
import { seriesData, seriesHref } from "@/lib/series";
import { MFGSelect, type MFGOption } from "../mfg-select";
import { ActionLink, MediaSlot } from "../portal-ui";
import { SeriesIdentity } from "../series-identity";
import { SportTime } from "../sport-time";
import { RacePodium, RaceResultsTable } from "./results-table";

type Filter = "series" | "season" | "round" | "session";

function ResultFilter({ id, label, options, value, placeholder, change }: {
  id: Filter; label: string; options: readonly MFGOption[]; value: string; placeholder?: string; change: (id: Filter, value: string) => void;
}) {
  return <div>
    <label htmlFor={"results-" + id}>{label}</label>
    <MFGSelect id={"results-" + id} options={options} value={value} disabled={!options.length}
      placeholder={placeholder ?? label} onValueChange={(next) => change(id, next)} />
  </div>;
}

function RaceHeader({ event, season, publication }: {
  event: ResultEvent; season?: ResultsSeason; publication: PublishedSession["bulletin"]["state"];
}) {
  const t = useTranslations("raceResults");
  const portal = useTranslations();
  const format = useFormatter();
  return <article className="results-race">
    <div className="results-race-image"><MediaSlot variant="circuit" image={event.image} sizes="(max-width: 720px) 100vw, 40vw" /></div>
    <div className="results-race-body">
      <div className="results-meta">
        <span>{portal("schedule.round", { round: event.round })}{season && " · " + season.label}</span>
        <span className="results-publication" data-state={publication}>
          {publication === "final" ? t("official") : portal(`championship.publication.${publication}`)}
        </span>
      </div>
      <h2>{event.title}</h2>
      <SeriesIdentity division={event.division} as="p" />
      <ul className="results-facts">
        <li><CalendarDays size={16} aria-hidden="true" />{event.startAt ? <SportTime instant={event.startAt} dateOnly /> : portal("schedule.datePending")}</li>
        {event.location && <li><MapPin size={16} aria-hidden="true" />{event.location}</li>}
        {event.lengthKm !== undefined && <li><Route size={16} aria-hidden="true" />
          {format.number(event.lengthKm, { style: "unit", unit: "kilometer" })}</li>}
      </ul>
      <div className="results-race-links">
        <Link href={raceHref(event.id)} className="text-link">{portal("schedule.details")}</Link>
        {event.circuitHref && <Link href={event.circuitHref} className="text-link">{portal("information.circuitDetails")}</Link>}
      </div>
    </div>
  </article>;
}

export function ResultsHub({ seasons, events }: { seasons: readonly ResultsSeason[]; events: readonly ResultEvent[] }) {
  const t = useTranslations("raceResults");
  const portal = useTranslations();
  const query = useSearchParams();
  const division = divisionSlugs.find((slug) => slug === query.get("series")) ?? divisionSlugs[0];
  const divisionEvents = newestResultEvents(events.filter((event) => event.division === division));
  const divisionSeasons = seasons.filter((season) => season.division === division);
  const season = divisionSeasons.find(({ id }) => id === query.get("season")) ??
    divisionSeasons.find(({ id }) => id === seriesData[division].currentSeasonId) ??
    divisionSeasons.find(({ id }) => id === divisionEvents.find((event) => event.sessions.length)?.seasonId) ??
    divisionSeasons.at(-1);
  const seasonEvents = divisionEvents.filter(({ seasonId }) => seasonId === season?.id);
  const race = seasonEvents.find(({ id }) => id === query.get("round")) ??
    seasonEvents.find((event) => event.sessions.length) ?? seasonEvents[0];

  const sessions: MFGOption[] = [
    { value: "qualifying", label: t("qualifying") },
    ...(race?.sessions.flatMap((entry) => entry.kind === "timed" && entry.name ? [{ value: entry.id, label: entry.name }] : []) ?? []),
    { value: "final", label: t("final") },
  ];
  const session = sessions.find(({ value }) => value === query.get("session")) ??
    sessions.find(({ value }) => value === (race?.sessions.some(({ kind }) => kind === "final") ? "final" : race?.sessions[0]?.id)) ??
    sessions[sessions.length - 1];
  const published = race?.sessions.find(({ id }) => id === session.value);
  const past = seasonEvents.filter((event) => event.id !== race?.id && event.sessions.length);
  const calendar = seriesHref(division, "calendar");
  const standings = seriesHref(division, "standings") + (season ? "&" + new URLSearchParams({ season: season.id }) : "");
  const raceOptions = [...seasonEvents].sort((a, b) => a.round - b.round);

  function change(key: Filter, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    if (key === "series") url.searchParams.delete("season");
    if (key === "series" || key === "season") url.searchParams.delete("round");
    if (key !== "session") url.searchParams.delete("session");
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = sessions.length;
    const next = event.key === "ArrowRight" ? (index + 1) % count :
      event.key === "ArrowLeft" ? (index + count - 1) % count : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : undefined;
    if (next === undefined) return;
    event.preventDefault();
    change("session", sessions[next].value);
    document.getElementById("results-tab-" + sessions[next].value)?.focus();
  }

  return <div className="shell results-content" data-division={division}>
    <section aria-labelledby="results-filter-title" className="results-filter-band">
      <div className="results-section-head"><h2 id="results-filter-title">{t("find")}</h2><Flag aria-hidden="true" size={22} /></div>
      <div className="results-filters">
        <ResultFilter id="series" label={portal("championship.division")} value={division} change={change}
          options={divisionSlugs.map((slug) => ({ value: slug, label: "MFG " + portal(`divisions.${slug}.title`) }))} />
        <ResultFilter id="season" label={portal("championship.season")} value={season?.id ?? ""} change={change}
          options={divisionSeasons.map(({ id, label }) => ({ value: id, label }))} placeholder={portal("championship.noSeason")} />
        <ResultFilter id="round" label={portal("championship.round")} value={race?.id ?? ""} change={change} placeholder={t("noRaces")}
          options={raceOptions.map(({ id, round, title }) => ({ value: id, label: portal("schedule.round", { round }) + " — " + title }))} />
        <ResultFilter id="session" label={t("session")} value={session.value} change={change} options={sessions} />
      </div>
    </section>

    {race && <RaceHeader event={race} season={season} publication={published?.bulletin.state ?? "pending"} />}

    <section className="results-sessions" aria-label={t("session")}>
      <div className="results-tabs" role="tablist" aria-label={t("tabs")}>
        {sessions.map(({ value, label }, index) => (
          <button key={value} id={"results-tab-" + value} role="tab" type="button" aria-selected={session.value === value}
            tabIndex={session.value === value ? 0 : -1} aria-controls="results-session-panel"
            onClick={() => change("session", value)} onKeyDown={(event) => onTabKey(event, index)}>
            {value === "final" ? <Flag size={17} aria-hidden="true" /> : <Timer size={17} aria-hidden="true" />}{label}
          </button>
        ))}
      </div>
      <div className="results-session-panel" id="results-session-panel" role="tabpanel"
        aria-labelledby={"results-tab-" + session.value} tabIndex={0}>
        {published && race && published.bulletin.entries.some((entry) => race.drivers.some(({ id }) => id === entry.driverId))
          ? <>
            {published.kind === "final" && <RacePodium entries={published.bulletin.entries} drivers={race.drivers} />}
            <RaceResultsTable session={published} drivers={race.drivers} title={session.label} />
          </>
          : <div className="results-empty">
            <span className="results-empty-icon">{session.value === "final" ? <Flag aria-hidden="true" /> : <Timer aria-hidden="true" />}</span>
            <div><h2>{t(session.value === "final" ? "finalEmpty" : "timedEmpty")}</h2>
              <p>{t(race ? "sessionPending" : "divisionEmpty")}</p></div>
            <ActionLink href={calendar}>{portal("home.calendarLink")}</ActionLink>
          </div>}
      </div>
    </section>

    <section className="results-history" aria-labelledby="results-history-title">
      <div className="results-section-head"><h2 id="results-history-title">{t("history")}</h2></div>
      {past.length ? <ul className="results-history-grid">
        {past.map((event) => <li key={event.id}>
          <Link className="results-history-card" href={resultsHref(event)} data-division={event.division}>
            <span className="results-history-round">{portal("schedule.round", { round: event.round })}</span>
            <span className="results-history-series">{portal(`divisions.${event.division}.title`)} · DIV. {seriesData[event.division].number}</span>
            <strong>{event.title}</strong>
            <span>{event.startAt ? <SportTime instant={event.startAt} dateOnly /> : portal("schedule.datePending")}</span>
            <span className="results-history-action">{t("openRace")}<ChevronRight size={16} aria-hidden="true" /></span>
          </Link>
        </li>)}
      </ul> : <p className="results-history-empty">{t("historyEmpty")}</p>}
    </section>

    <nav className="results-related" aria-label={t("related")}>
      <Link href={standings}><Trophy size={19} aria-hidden="true" />{portal("championship.title")}<ChevronRight size={17} aria-hidden="true" /></Link>
      <Link href={regulationHref(division) + "#sporting"}><Flag size={19} aria-hidden="true" />{portal("sections.regulations.title")}<ChevronRight size={17} aria-hidden="true" /></Link>
    </nav>
  </div>;
}
