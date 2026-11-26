import type { PortalImage } from "@/components/portal-ui";
import type { Division, MediaItem } from "./competition";

export const raceStatuses = ["pending", "scheduled", "qualifying", "racing", "finished", "postponed", "cancelled"] as const;
export type RaceStatus = (typeof raceStatuses)[number];
export const sessionKinds = ["qualifying", "race", "other"] as const;
export type RaceSession = {
  id: string;
  kind: (typeof sessionKinds)[number];
  title?: string;
  startAt: string;
  endAt?: string;
};
export const raceResources = ["entries", "qualifyingResults", "grid", "raceResults", "news", "broadcast"] as const;

export type Race = {
  id: string;
  seasonId: string;
  round: number;
  title: string;
  division: Division;
  location?: string;
  state: RaceStatus;
  // Store ISO 8601 instants in UTC. endAt is exclusive.
  schedule?: { startAt: string; endAt?: string; confirmed: boolean };
  sessions?: readonly RaceSession[];
  image?: PortalImage;
  courseId?: string;
  course?: {
    name: string;
    lengthKm?: number;
    layout?: string;
    elevationM?: number;
    description?: string;
    features?: readonly string[];
    map?: PortalImage;
    photos?: readonly PortalImage[];
  };
  resources?: Partial<Record<(typeof raceResources)[number], string>>;
  gallery?: readonly MediaItem[];
};

export type RaceSeason = { id: string; label: string };

const dayFormatters = new Map<string, Intl.DateTimeFormat>();

export function dayKey(date: string | number, timeZone: string) {
  let formatter = dayFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    dayFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(new Date(date));
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

export function dayStamp(day: string) {
  return Date.parse(day + "T00:00:00Z");
}

export function monthAt(month: string, offset: number) {
  const date = new Date(dayStamp(month + "-01"));
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

export function fitsMonth(value: string | null): value is string {
  return Boolean(value && /^[2-8]\d{3}-(0[1-9]|1[0-2])$/.test(value));
}

export function parseInstant(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? Date.parse(value) : NaN;
}

export function sortRaces(records: readonly Race[]) {
  const at = (race: Race) => {
    const time = race.schedule ? parseInstant(race.schedule.startAt) : NaN;
    return Number.isFinite(time) ? time : Infinity;
  };
  return [...records].sort((a, b) => (at(a) - at(b)) || a.round - b.round);
}

export function confirmedSchedule(race: Race) {
  const schedule = race.schedule;
  if (!schedule?.confirmed || race.state === "pending" || race.state === "postponed" || race.state === "cancelled") return;
  if (!Number.isFinite(parseInstant(schedule.startAt))) return;
  return schedule;
}

export function upcomingRace(records: readonly Race[], now: number) {
  for (const race of sortRaces(records)) {
    const schedule = confirmedSchedule(race);
    if (race.state === "scheduled" && schedule && Date.parse(schedule.startAt) > now) return { race, schedule };
  }
}

export const calendarKeys = ["season", "series", "status", "view", "month", "preview"] as const;
export type CalendarKey = (typeof calendarKeys)[number];
export type CalendarSearch = Record<string, string | string[] | undefined>;

export function calendarQuery(search: { get: (key: string) => string | null }) {
  const params = new URLSearchParams();
  for (const key of calendarKeys) {
    const value = search.get(key);
    if (value) params.set(key, value);
  }
  return params;
}

export function raceHref(id: string, query?: URLSearchParams) {
  const search = query?.toString();
  return "/calendar/" + encodeURIComponent(id) + (search ? "?" + search : "");
}
