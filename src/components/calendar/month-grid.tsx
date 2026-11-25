import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { divisionSlugs } from "@/lib/portal";
import { dayKey, dayStamp, fitsMonth, monthAt, parseInstant, type Race } from "@/lib/race-schedule";

const dayLength = 86400000;

export function MonthGrid({ month, today, zone, races, onMonth, details }: {
  month: string; today: string; zone: string; races: readonly Race[];
  onMonth: (value: string | null) => void; details: (race: Race) => string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const weekStart = locale === "es" ? 1 : 0;
  const first = dayStamp(month + "-01");
  const firstWeekday = (new Date(first).getUTCDay() - weekStart + 7) % 7;
  const previousMonth = monthAt(month, -1);
  const nextMonth = monthAt(month, 1);
  const daysInMonth = (dayStamp(nextMonth + "-01") - first) / dayLength;
  const cells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const spans = races.flatMap((race) => {
    const schedule = race.schedule;
    if (!schedule) return [];
    const start = parseInstant(schedule.startAt);
    if (!Number.isFinite(start)) return [];
    const end = schedule.endAt ? parseInstant(schedule.endAt) - 1 : start;
    return [{ start: dayKey(start, zone), last: dayKey(end > start ? end : start, zone), race }];
  });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const dateLabel = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" });
  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const rows = Array.from({ length: cells / 7 }, (_, week) =>
    Array.from({ length: 7 }, (_, col) => new Date(first + (week * 7 + col - firstWeekday) * dayLength)));

  return (
    <div className="calendar-month">
      <div className="calendar-month-toolbar">
        <h3 aria-live="polite" id="month-title">{title}</h3>
        <div>
          <button type="button" aria-label={t("schedule.previousMonth")} disabled={!fitsMonth(previousMonth)} onClick={() => onMonth(previousMonth)}><ChevronLeft size={19} /></button>
          <button type="button" onClick={() => onMonth(null)}>{t("schedule.currentMonth")}</button>
          <button type="button" aria-label={t("schedule.nextMonth")} disabled={!fitsMonth(nextMonth)} onClick={() => onMonth(nextMonth)}><ChevronRight size={19} /></button>
        </div>
      </div>
      <table aria-labelledby="month-title">
        <thead><tr>{rows[0].map((date) => <th key={date.toISOString()} scope="col">{weekday.format(date)}</th>)}</tr></thead>
        <tbody>
          {rows.map((days) => <tr key={days[0].toISOString()}>
            {days.map((date) => {
              const key = date.toISOString().slice(0, 10);
              const events = spans.filter(({ start, last }) => start <= key && last >= key);
              return (
                <td key={key} data-outside={!key.startsWith(month)} data-date={key}>
                  <time dateTime={key} aria-current={key === today ? "date" : undefined}
                    aria-label={dateLabel.format(date)}>{date.getUTCDate()}</time>
                  {events.length > 0 && <ul>{events.map(({ race }) => (
                    <li key={race.id}>
                      <Link href={details(race)} data-division={race.division} title={race.title}
                        aria-label={t("schedule.monthEvent", { title: race.title, date: dateLabel.format(date) })}>
                        <span>{race.title}</span>
                      </Link>
                    </li>
                  ))}</ul>}
                </td>
              );
            })}
          </tr>)}
        </tbody>
      </table>
      <ul className="month-legend" aria-label={t("schedule.legend")}>
        {divisionSlugs.map((division) => <li key={division} data-division={division}>{t(`divisions.${division}.title`)}</li>)}
      </ul>
    </div>
  );
}
