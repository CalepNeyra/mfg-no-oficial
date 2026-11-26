import type { PortalImage } from "@/components/portal-ui";
import type { Bulletin, Driver, ResultEntry, TimedEntry } from "./championship";
import type { Division } from "./competition";
import { parseInstant, type Race, type RaceSeason } from "./race-schedule";

export type PublishedSession =
  | { id: "final"; kind: "final"; bulletin: Bulletin<ResultEntry>; points: Record<string, number> }
  | { id: string; kind: "timed"; name?: string; bulletin: Bulletin<TimedEntry>; format?: { finalPlaces: number; pointPlaces?: number } };

type RaceReference = Pick<Race, "division" | "seasonId" | "id">;

export type ResultEvent = RaceReference & {
  round: number;
  title: string;
  startAt?: string;
  location?: string;
  lengthKm?: number;
  image?: PortalImage;
  circuitHref?: string;
  drivers: readonly Driver[];
  sessions: readonly PublishedSession[];
};

export type ResultsSeason = RaceSeason & { division: Division };

export function resultsHref(race: RaceReference, session?: string) {
  const query = new URLSearchParams({ series: race.division, season: race.seasonId, round: race.id });
  if (session) query.set("session", session);
  return "/results?" + query;
}

export function newestResultEvents(events: readonly ResultEvent[]) {
  const start = (event: ResultEvent) => {
    const instant = event.startAt ? parseInstant(event.startAt) : NaN;
    return Number.isFinite(instant) ? instant : -Infinity;
  };
  return [...events].sort((a, b) => start(b) - start(a) || b.round - a.round);
}

export function podiumEntries(entries: readonly ResultEntry[], drivers: readonly Driver[]) {
  const finishers = entries.filter(({ outcome }) => outcome !== "absent" && outcome !== "disqualified");
  const podium = [1, 2, 3].map((position) => {
    const placements = finishers.filter(({ finalPosition }) => finalPosition === position);
    if (placements.length !== 1) return null;
    const entry = placements[0];
    const driver = drivers.find(({ id }) => id === entry.driverId);
    return driver ? { position, driver, entry } : null;
  });
  return podium.every((place) => place !== null) && new Set(podium.map((place) => place?.driver.id)).size === 3
    ? podium.filter((place) => place !== null) : [];
}
