"use client";

import { CalendarDays, Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { divisionSlugs } from "@/lib/portal";
import { dayKey, fitsMonth, raceHref, raceStatuses, sortRaces, upcomingRace, type Race, type RaceSeason } from "@/lib/race-schedule";
import { EmptyState } from "../portal-ui";
import { CalendarFilters } from "./calendar-filters";
import { useCalendarQuery } from "./calendar-url";
import { CalendarPreviewNotice, FeaturedRace, RaceCard } from "./event-card";
import { MonthGrid } from "./month-grid";

function subscribeToClock(notify: () => void) {
  const timer = window.setInterval(notify, 15000);
  return () => window.clearInterval(timer);
}

function readClock() {
  return Math.floor(Date.now() / 1000) * 1000;
}

export function CompetitionCalendar({ records, seasons, now, preview }: {
  records: readonly Race[]; seasons: readonly RaceSeason[]; now: number; preview: boolean;
}) {
  const t = useTranslations("schedule");
  const { query, zone, update } = useCalendarQuery();
  const clock = useSyncExternalStore(subscribeToClock, readClock, () => now);
  const today = dayKey(clock, zone);
  const monthValue = query.get("month");
  const month = fitsMonth(monthValue) ? monthValue : today.slice(0, 7);
  const series = divisionSlugs.find((division) => division === query.get("series"));
  const season = seasons.find(({ id }) => id === query.get("season"))?.id;
  const status = raceStatuses.find((value) => value === query.get("status"));
  const filtered = sortRaces(records.filter((race) =>
    (!season || race.seasonId === season) &&
    (!series || race.division === series) &&
    (!status || race.state === status)));
  const next = upcomingRace(filtered, clock);
  const details = (race: Race) => raceHref(race.id, query);

  return (
    <div className="shell calendar-content">
      {preview && <CalendarPreviewNotice />}
      <CalendarFilters query={query} seasons={seasons} update={update} now={clock} />
      <section aria-labelledby="calendar-next">
        <h2 id="calendar-next">{t("next")}</h2>
        {next ? <FeaturedRace race={next.race} start={next.schedule.startAt} zone={zone} href={details(next.race)} />
          : <EmptyState icon={Flag}>{t("noNext")}</EmptyState>}
      </section>
      <section aria-labelledby="calendar-rounds">
        <h2 id="calendar-rounds">{t("rounds")}</h2>
        {query.get("view") === "month"
          ? <MonthGrid month={month} today={today} zone={zone} races={filtered} details={details} onMonth={(value) => update("month", value)} />
          : filtered.length
            ? <div className="calendar-races">{filtered.map((race) => <RaceCard key={race.id} race={race} zone={zone} href={details(race)} />)}</div>
            : <EmptyState icon={CalendarDays}>{t("empty")}</EmptyState>}
      </section>
    </div>
  );
}
