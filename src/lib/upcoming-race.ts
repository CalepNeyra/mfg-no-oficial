import { connection } from "next/server";
import { races, type Division } from "./competition";
import { upcomingRace } from "./race-schedule";

export async function getUpcomingRace(division?: Division) {
  if (!races.length) return undefined;
  await connection();
  const records = division ? races.filter((race) => race.division === division) : races;
  return upcomingRace(records, Date.now());
}
