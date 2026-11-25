"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Division } from "@/lib/competition";
import { divisionSlugs } from "@/lib/portal";
import { japanTime, raceHref, sortRaces, type Race } from "@/lib/race-schedule";
import { Link } from "@/i18n/navigation";
import { RaceDate, RaceStatusBadge } from "./calendar/event-card";
import { EmptyState, MediaSlot } from "./portal-ui";

const filters = ["all", ...divisionSlugs] as const;

export function RaceCalendar({ races }: { races: readonly Race[] }) {
  const t = useTranslations();
  const [filter, setFilter] = useState<Division | "all">("all");
  const filtered = sortRaces(filter === "all" ? races : races.filter(({ division }) => division === filter));

  return (
    <>
      <div className="filters" role="group" aria-label={t("calendar.filter")}>
        {filters.map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value === "all" ? t("calendar.all") : t(`divisions.${value}.title`)}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {filtered.length ? <div className="race-grid">{filtered.map((race) => (
          <article className="race-card" key={race.id}>
            <MediaSlot variant="circuit" image={race.image} />
            <div className="race-body">
              <p className="overline">{t("calendar.round", { round: race.round, series: t(`divisions.${race.division}.title`) })}</p>
              <h3><Link href={raceHref(race.id)}>{race.title}</Link></h3>
              <RaceDate schedule={race.schedule} zone={japanTime} />
              {race.location && <p>{race.location}</p>}
              <p className="race-status"><RaceStatusBadge state={race.state} /></p>
            </div>
          </article>
        ))}</div> : <EmptyState icon={CalendarDays}>{t("sections.calendar.empty")}</EmptyState>}
      </div>
    </>
  );
}
