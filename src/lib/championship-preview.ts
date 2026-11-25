import type { Championship, ChampionshipRound, Driver, GridEntry, ResultEntry, RoundPublication, TimedEntry } from "./championship";
import { mfgReferenceScores } from "./championship-scoring";
import type { Division } from "./competition";

const divisions = ["super-series", "freshman-series"] as const;
const seasons = [{ id: "qa-a", label: "QA A" }, { id: "qa-b", label: "QA B" }] as const;
const countries = ["JP", "ES", "PE", "GB"];

export function developmentStandings(locale: string) {
  const label = locale === "ja" ? "テストドライバー" : locale === "en" ? "Test driver" : "Piloto de prueba";
  const raceLabel = locale === "ja" ? "テストラウンド" : locale === "en" ? "Test round" : "Ronda de prueba";
  const championships: Championship[] = [];
  const rounds: (ChampionshipRound & { division: Division; seasonId: string })[] = [];

  for (const division of divisions) for (const { id: seasonId } of seasons) {
    const freshman = division === "freshman-series";
    const drivers: Driver[] = Array.from({ length: freshman ? 18 : 32 }, (_, i) => ({
      id: "driver-" + String(i + 1).padStart(2, "0"),
      name: label + " " + String(i + 1).padStart(2, "0"),
      countryCode: countries[i % countries.length],
      number: (freshman ? "F" : "") + (i + 1),
      vehicle: { manufacturer: i % 2 ? "QA Motors" : "QA Works", model: i % 2 ? "Test B" : "Test A" },
    }));
    const publications: RoundPublication[] = [];
    for (const round of [1, 2]) {
      const raceId = seasonId + "-" + division + "-" + round;
      rounds.push({ id: raceId, round, title: raceLabel + " " + round, division, seasonId });
      const line = round === 1 ? drivers : [drivers[1], drivers[0], ...drivers.slice(2)];
      const updatedAt = "2025-04-" + (round === 1 ? "12" : "19") + "T10:00:00Z";
      const day = updatedAt.slice(0, 10);
      const qualification: TimedEntry[] = line.map(({ id }, index) => ({
        driverId: id, position: index + 1, milliseconds: 68730 + round * 500 + index * 185, day,
      }));
      const finals = freshman ? 8 : 15;
      const grid: GridEntry[] = [line[1], line[0], ...line.slice(2, finals)].map(({ id }, index) => ({ driverId: id, position: index + 1 }));
      const result: ResultEntry[] = line.map(({ id }, index) => {
        const position = index + 1;
        const outcome = position === line.length ? "absent" : position === line.length - 1 ? "disqualified" :
          position === finals ? "retired" : "participated";
        const award = outcome !== "participated" ? null : position <= finals ? { source: "final" as const, position } :
          !freshman && position <= 30 ? { source: "qualifying" as const, position } : null;
        return { driverId: id, outcome, award, finalPosition: award?.source === "final" ? position : undefined,
          startedFinal: position <= finals, deduction: round === 2 && id === drivers[0].id ? "0.15" : undefined };
      });
      publications.push({
        raceId,
        qualification: { state: round === 1 ? "final" : "provisional", updatedAt, entries: qualification, ghostReferenceMs: freshman ? 71000 : undefined },
        grid: { state: round === 1 ? "final" : "pending", updatedAt, entries: grid },
        result: { state: round === 1 ? "final" : "corrected", updatedAt, entries: result },
      });
    }
    championships.push({
      division, seasonId, drivers, publications, qualifyingFormat: { finalPlaces: freshman ? 8 : 15, pointPlaces: freshman ? 8 : 30 },
      scoring: freshman
        ? { revision: "QA-F", ratified: true, tieBreaks: [], final: {1:"6.2",2:"4.1",3:"3.3"}, qualifying: {} }
        : { revision: "QA-S", ratified: true, tieBreaks: ["wins"], ...mfgReferenceScores },
    });
  }
  return { championships, rounds, seasons };
}
