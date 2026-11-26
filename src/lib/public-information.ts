import "server-only";

import type { PortalImage } from "@/components/portal-ui";
import { championships, publicationRounds } from "./championship-data";
import { buildChampionship, isPublished, pointScale } from "./championship-scoring";
import { resultsHref } from "./race-results";
import { calendarSeasons, races, type Division } from "./competition";

export type PublicDriverSummary = {
  slug: string; name: string; number: string; countryCode?: string; photograph?: PortalImage;
  division: Division; seasons: readonly string[]; manufacturer?: string; model?: string;
};

type DriverProfile = PublicDriverSummary & {
  published: boolean;
  competitorId: string;
  biography?: string;
  vehicle?: {
    photograph?: PortalImage; engine?: string; powerPs?: number; weightKg?: number;
    drivetrain?: string; transmission?: string;
  };
};

export type PublicCircuitSummary = {
  slug: string; name: string; location?: string; lengthKm?: number; image?: PortalImage; divisions: readonly Division[];
};

type CircuitProfile = PublicCircuitSummary & {
  published: boolean;
  layout?: string; elevationM?: number; description?: string; map?: PortalImage;
  features?: readonly string[]; sectors?: readonly { name: string; description?: string }[];
  photographs?: readonly PortalImage[];
};

// Enter approved public summaries only. Registration drafts and staff records are separate.
const driverProfiles: readonly DriverProfile[] = [];
const circuitProfiles: readonly CircuitProfile[] = [];

export function driverHref(slug: string) {
  return "/drivers/" + encodeURIComponent(slug);
}

export function circuitHref(slug: string) {
  return "/circuits/" + encodeURIComponent(slug);
}

export function publicDrivers(): PublicDriverSummary[] {
  return driverProfiles.filter(({ published }) => published).map(
    ({ slug, name, number, countryCode, photograph, division, seasons, manufacturer, model }) =>
      ({ slug, name, number, countryCode, photograph, division, seasons, manufacturer, model }),
  );
}

export function publicCircuits(): PublicCircuitSummary[] {
  return circuitProfiles.filter(({ published }) => published).map(
    ({ slug, name, location, lengthKm, image, divisions }) => ({ slug, name, location, lengthKm, image, divisions }),
  );
}

export function publicDriverHref(competitorId: string) {
  const profile = driverProfiles.find((driver) => driver.published && driver.competitorId === competitorId);
  return profile ? driverHref(profile.slug) : undefined;
}

export function findDriver(slug: string) {
  return driverProfiles.find((driver) => driver.slug === slug && driver.published);
}

export function findCircuit(slug: string) {
  return circuitProfiles.find((circuit) => circuit.slug === slug && circuit.published);
}

export function driverHistory(driver: DriverProfile) {
  return championships.flatMap((season) => {
    const entry = season.drivers.find(({ id }) => id === driver.competitorId);
    if (!entry) return [];
    const rounds = publicationRounds(season.division, season.seasonId);
    const standings = buildChampionship(season, rounds);
    const published = rounds.flatMap((round) => {
      const result = season.publications.find(({ raceId }) => raceId === round.id)?.result;
      const record = isPublished(result) ? result?.entries.find(({ driverId }) => driverId === entry.id) : undefined;
      if (!record) return [];
      const points = standings.snapshots[round.id]?.find(({ driver }) => driver.id === entry.id)?.cells[round.id];
      return [{ ...round, href: resultsHref({ id: round.id, division: season.division, seasonId: season.seasonId }, "final"),
        position: record.finalPosition, outcome: record.outcome,
        points: points ? (points.earned - points.deduction) / pointScale : undefined }];
    });
    if (!published.length) return [];
    const total = standings.rows.find(({ driver }) => driver.id === entry.id);
    return [{
      id: season.division + "-" + season.seasonId,
      season: calendarSeasons.find(({ id }) => id === season.seasonId)?.label,
      division: season.division, rounds: published, points: total ? total.points / pointScale : undefined,
      wins: published.filter(({ position }) => position === 1).length,
    }];
  });
}

export function racesAtCircuit(slug: string) {
  return races.filter(({ courseId }) => courseId === slug);
}
