import { Clock3, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { parseInstant, type Race, type RaceStatus } from "@/lib/race-schedule";
import { ActionLink, MediaSlot } from "../portal-ui";
import { RaceCountdown } from "../race-countdown";
import { SeriesIdentity } from "../series-identity";

export function CalendarPreviewNotice() {
  const t = useTranslations("schedule");
  return <p className="calendar-preview">{t("preview")}</p>;
}

export function RaceStatusBadge({ state }: { state: RaceStatus }) {
  const t = useTranslations("schedule.status");
  return <span className="event-status" data-state={state}>{t(state)}</span>;
}

export function RaceDate({ schedule, zone }: { schedule?: Race["schedule"]; zone: string }) {
  const t = useTranslations("schedule");
  const locale = useLocale();
  if (!schedule || !Number.isFinite(parseInstant(schedule.startAt))) return <span>{t("datePending")}</span>;

  const formatter = new Intl.DateTimeFormat(locale, { timeZone: zone, dateStyle: "long" });
  const start = new Date(schedule.startAt);
  const end = schedule.endAt && new Date(parseInstant(schedule.endAt) - 1);
  return end && end > start
    ? <time dateTime={schedule.startAt}>{formatter.formatRange(start, end)}</time>
    : <time dateTime={schedule.startAt}>{formatter.format(start)}</time>;
}

export function SessionTime({ start, end, zone, full = false }: { start: string; end?: string; zone: string; full?: boolean }) {
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: zone, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    timeZoneName: full ? "short" : undefined,
  });
  const from = new Date(parseInstant(start));
  const until = end && new Date(parseInstant(end));
  if (!Number.isFinite(from.getTime())) return null;
  const hasEnd = until && until > from;
  const startLabel = formatter.format(from);
  let label = startLabel;
  if (hasEnd) {
    const offsetChanged = full && formatter.formatToParts(from).find(({ type }) => type === "timeZoneName")?.value !==
      formatter.formatToParts(until).find(({ type }) => type === "timeZoneName")?.value;
    label = offsetChanged ? `${startLabel} \u2013 ${formatter.format(until)}` : formatter.formatRange(from, until);
  }
  return <time dateTime={from.toISOString()}>{label}</time>;
}

export function RaceCard({ race, zone, href }: { race: Race; zone: string; href: string }) {
  const t = useTranslations("schedule");
  const portal = useTranslations();
  const sessions = (race.sessions ?? []).filter(({ kind }) => kind === "race" || kind === "qualifying")
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));

  return (
    <article className="event-card" data-division={race.division}>
      <div className="event-card-image">
        <MediaSlot variant="circuit" image={race.image} />
        <span className="event-round">{t("round", { round: race.round })}</span>
      </div>
      <div className="event-card-copy">
        <div className="event-meta"><span>{portal(`divisions.${race.division}.title`)}</span><RaceStatusBadge state={race.state} /></div>
        <h3><Link href={href}>{race.title}</Link></h3>
        <div className="event-facts">
          <p><Clock3 size={16} aria-hidden="true" /><RaceDate schedule={race.schedule} zone={zone} /></p>
          {race.location && <p><MapPin size={16} aria-hidden="true" />{race.location}</p>}
        </div>
        {sessions.length > 0 && <dl className="event-sessions">
          {sessions.map((session) => <div key={session.id}><dt>{session.title ?? t(`session.${session.kind}`)}</dt>
            <dd><SessionTime start={session.startAt} end={session.endAt} zone={zone} /></dd></div>)}
        </dl>}
        <ActionLink href={href}>{t("details")}</ActionLink>
      </div>
    </article>
  );
}

export function FeaturedRace({ race, start, zone, href }: { race: Race; start: string; zone: string; href: string }) {
  const t = useTranslations("schedule");
  return (
    <article className="calendar-featured" data-division={race.division}>
      <MediaSlot variant="circuit" image={race.image} loading="eager" sizes="(max-width: 720px) 100vw, 52vw" />
      <div className="calendar-featured-copy">
        <SeriesIdentity division={race.division} as="h3" />
        <div className="event-meta"><span>{t("round", { round: race.round })}</span><RaceStatusBadge state={race.state} /></div>
        <h4>{race.title}</h4>
        <div className="event-facts">
          <p><Clock3 size={16} aria-hidden="true" /><SessionTime start={start} zone={zone} full /></p>
          {race.location && <p><MapPin size={16} aria-hidden="true" />{race.location}</p>}
        </div>
        <RaceCountdown date={start} />
        <ActionLink href={href} primary>{t("details")}</ActionLink>
      </div>
    </article>
  );
}
