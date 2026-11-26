import { CalendarDays, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { divisionSlugs } from "@/lib/portal";
import { raceStatuses, type CalendarKey, type RaceSeason } from "@/lib/race-schedule";
import { MFGSelect, type MFGOption } from "../mfg-select";

import { SportTimeZoneSelect } from "./sport-time-zone-select";
export function CalendarFilters({ query, seasons, update, now }: {
  now: number; query: URLSearchParams; seasons: readonly RaceSeason[]; update: (key: CalendarKey, value: string | null) => void;
}) {
  const t = useTranslations("schedule");
  const portal = useTranslations();
  const filters: { key: CalendarKey; label: string; options: readonly MFGOption[] }[] = [
    { key: "season", label: t("season"), options: [{ value: "all", label: t("allSeasons") }, ...seasons.map(({ id, label }) => ({ value: id, label }))] },
    { key: "series", label: t("division"), options: [{ value: "all", label: t("allDivisions") }, ...divisionSlugs.map((value) => ({ value, label: "MFG " + portal(`divisions.${value}.title`) }))] },
    { key: "status", label: t("eventStatus"), options: [{ value: "all", label: t("allStatuses") }, ...raceStatuses.map((value) => ({ value, label: t(`status.${value}`) }))] },
  ];

  return (
    <div className="calendar-filters" role="group" aria-label={t("filters")}>
      {filters.map(({ key, label, options }) => {
        const selected = query.get(key);
        return (
          <div className="calendar-select" key={key}>
            <label htmlFor={`schedule-${key}`}>{label}</label>
            <MFGSelect id={`schedule-${key}`} options={options} placeholder={label}
              value={options.some(({ value }) => value === selected) && selected ? selected : "all"}
              onValueChange={(value) => update(key, value === "all" ? null : value)} />
          </div>
        );
      })}
      <SportTimeZoneSelect now={now} />
      <div className="calendar-view" role="group" aria-label={t("view")}>
        <button type="button" aria-pressed={query.get("view") !== "month"} onClick={() => update("view", null)}>
          <List size={17} aria-hidden="true" />{t("list")}
        </button>
        <button type="button" aria-pressed={query.get("view") === "month"} onClick={() => update("view", "month")}>
          <CalendarDays size={17} aria-hidden="true" />{t("month")}
        </button>
      </div>
    </div>
  );
}
