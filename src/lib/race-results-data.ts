import "server-only";

import type { Locale } from "@/i18n/routing";
import { championships } from "./championship-data";
import { isPublished, scoreRoundEntry } from "./championship-scoring";
import { calendarSeasons, races } from "./competition";
import { circuitHref, findCircuit, publicDriverHref } from "./public-information";
import { parseInstant, type Race, type RaceSeason } from "./race-schedule";
import type { Championship } from "./championship";
import type { PublishedSession, ResultEvent, ResultsSeason } from "./race-results";

export function buildPublicResults(locale: Locale, records: readonly Race[], seasons: readonly RaceSeason[], standings: readonly Championship[]) {
  const labels = new Map(seasons.map(({ id, label }) => [id, label]));
  const championshipBySeason = new Map(standings.map((record) => [record.division + "/" + record.seasonId, record]));
  const availableSeasons = new Map<string, ResultsSeason>();
  for (const { division, seasonId } of [...records, ...standings]) {
    const label = labels.get(seasonId);
    if (label) availableSeasons.set(division + "/" + seasonId, { id: seasonId, label, division });
  }

  const events: ResultEvent[] = records.map((race) => {
    const championship = championshipBySeason.get(race.division + "/" + race.seasonId);
    const round = championship?.publications.find(({ raceId }) => raceId === race.id);
    const qualification = round?.qualification;
    const final = round?.result;
    const sessions: PublishedSession[] = [];
    if (qualification && isPublished(qualification)) {
      sessions.push({ id: "qualifying", kind: "timed", bulletin: qualification, format: championship?.qualifyingFormat });
    }
    for (const { id, names } of championship?.additionalSessions ?? []) {
      if (!/^[a-z0-9-]+$/.test(id) || id === "qualifying" || id === "final" || sessions.some((session) => session.id === id)) continue;
      const bulletin = round?.additionalSessions?.[id];
      if (bulletin && isPublished(bulletin)) sessions.push({ id, kind: "timed", name: names[locale], bulletin });
    }
    if (final && isPublished(final)) {
      const policy = championship?.scoring;
      const points = policy?.ratified ? Object.fromEntries(final.entries.map((entry) => {
        const { earned, deduction } = scoreRoundEntry(policy, entry);
        return [entry.driverId, earned - deduction];
      })) : {};
      // The scoring bulletin may also include drivers who took part only in qualifying.
      const entries = final.entries.filter(({ startedFinal, outcome, award, finalPosition }) =>
        startedFinal !== false || finalPosition !== undefined || award?.source === "final" ||
        (outcome !== "participated" && award?.source !== "qualifying"));
      sessions.push({ id: "final", kind: "final", bulletin: { ...final, entries }, points });
    }

    const driverIds = new Set(sessions.flatMap(({ bulletin }) => bulletin.entries.map(({ driverId }) => driverId)));
    const drivers = (championship?.drivers ?? []).filter(({ id }) => driverIds.has(id))
      .map(({ id, name, number, countryCode, photograph, vehicle }) => ({
        id, name, number, countryCode, photograph, href: publicDriverHref(id),
        vehicle: { manufacturer: vehicle.manufacturer, model: vehicle.model },
      }));
    const circuit = race.courseId ? findCircuit(race.courseId) : undefined;
    const start = race.schedule?.startAt;
    return {
      id: race.id, title: race.title, round: race.round, division: race.division, seasonId: race.seasonId,
      startAt: start && Number.isFinite(parseInstant(start)) ? start : undefined,
      location: race.location ?? circuit?.location,
      lengthKm: race.course?.lengthKm ?? circuit?.lengthKm,
      image: race.image ?? circuit?.image ?? race.course?.photos?.[0],
      circuitHref: circuit ? circuitHref(circuit.slug) : undefined,
      drivers, sessions,
    };
  });
  return { seasons: [...availableSeasons.values()], events };
}

export function publicResultsData(locale: Locale) {
  return buildPublicResults(locale, races, calendarSeasons, championships);
}
