import "server-only";

import type { Championship, ChampionshipRound } from "./championship";
import { buildChampionship, isPublished, pointScale } from "./championship-scoring";
import { calendarSeasons, races, type Division } from "./competition";
import { raceHref } from "./race-schedule";

// Store published versioned snapshots and decision history here until a database adapter is added.
export const championships: readonly Championship[] = [];

export function publicationRounds(division: Division, seasonId: string): ChampionshipRound[] {
  return races.filter((race) => race.division === division && race.seasonId === seasonId)
    .sort((a, b) => a.round - b.round)
    .map(({ id, round, title }) => ({ id, round, title, href: raceHref(id) }));
}

export function publicStandingsData() {
  return {
    seasons: calendarSeasons,
    championships: championships.map(({ division, seasonId, scoring, qualifyingFormat, drivers, publications }) => ({
      division, seasonId, scoring: scoring?.ratified ? scoring : undefined, qualifyingFormat,
      drivers: drivers.map(({ id, name, number, countryCode, photograph, vehicle }) => ({
        id, name, number, countryCode, photograph,
        vehicle: { manufacturer: vehicle.manufacturer, model: vehicle.model },
      })),
      publications: publications.map(({ raceId, qualification, grid, result }) => ({
        raceId,
        qualification: isPublished(qualification) ? qualification : undefined,
        grid: isPublished(grid) ? grid : undefined,
        result: isPublished(result) ? result : undefined,
      })),
    })),
    rounds: races.map(({ id, round, title, division, seasonId }) => ({ id, round, title, division, seasonId, href: raceHref(id) })),
  };
}

export function previewChampionship(division: Division, preferredSeason?: string) {
  const records = championships.filter((entry) => entry.division === division);
  const selected = records.find(({ seasonId }) => seasonId === preferredSeason) ?? records.at(-1);
  if (!selected) return [];
  return buildChampionship(selected, publicationRounds(division, selected.seasonId)).rows.map(({ driver, position, points }) => ({
    position, number: driver.number, driver: driver.name, portrait: driver.photograph,
    nationality: driver.countryCode ?? "", car: driver.vehicle.manufacturer + " " + driver.vehicle.model,
    points: points / pointScale,
  }));
}

export function eventStandingsHref(division: Division, seasonId: string, raceId: string) {
  const round = championships.find((entry) => entry.division === division && entry.seasonId === seasonId)
    ?.publications.find((entry) => entry.raceId === raceId);
  if (!round || (!isPublished(round.qualification) && !isPublished(round.result) && !isPublished(round.grid))) return;
  const tab = isPublished(round.qualification) ? "qualifying" : isPublished(round.grid) ? "finalists" : "points";
  return "/standings?" + new URLSearchParams({ series: division, season: seasonId, round: raceId, tab });
}
