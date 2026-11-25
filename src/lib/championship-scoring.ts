import type { Championship, ChampionshipRound, ChampionshipRow, Publication, PublicationState, TieBreak } from "./championship";

export const pointScale = 1000;
// Reference only. A published season needs its own ratified policy and revision.
export const mfgReferenceScores = {
  final: { 1:"9.0", 2:"8.5", 3:"8.0", 4:"7.5", 5:"7.0", 6:"6.5", 7:"6.0", 8:"5.5", 9:"5.0", 10:"4.5", 11:"4.0", 12:"3.5", 13:"3.0", 14:"2.5", 15:"2.0" },
  qualifying: { 16:"1.5", 17:"1.4", 18:"1.3", 19:"1.2", 20:"1.1", 21:"1.0", 22:"0.9", 23:"0.8", 24:"0.7", 25:"0.6", 26:"0.5", 27:"0.4", 28:"0.3", 29:"0.2", 30:"0.1" },
} as const;

// Store decimal strings at the boundary. NUMERIC(12,3) / Prisma Decimal can round-trip them.
export function pointsToUnits(value: string) {
  if (!/^\d{1,9}(?:\.\d{1,3})?$/.test(value)) throw new Error("Invalid point value: " + value);
  const [whole, decimals = ""] = value.split(".");
  return Number(whole) * pointScale + Number(decimals.padEnd(3, "0"));
}

export function isPublished(value?: Publication): boolean {
  return Boolean(value && value.state !== "pending");
}

const statePriority: Record<PublicationState, number> = { pending: -1, final: 0, corrected: 1, provisional: 2, review: 3 };

export function aggregatePublications(publications: readonly Publication[]): Publication {
  return publications.filter(isPublished).reduce<Publication>((combined, publication) => ({
    state: statePriority[publication.state] > statePriority[combined.state] ? publication.state : combined.state,
    updatedAt: (publication.updatedAt ?? "") > (combined.updatedAt ?? "") ? publication.updatedAt : combined.updatedAt,
  }), { state: "pending" });
}

export function buildChampionship(championship: Championship, rounds: readonly ChampionshipRound[]) {
  const policy = championship.scoring;
  const totals = new Map<string, ChampionshipRow>();
  const snapshots: Record<string, ChampionshipRow[]> = {};
  const used: Publication[] = [];
  let rows: ChampionshipRow[] = [];
  if (!policy?.ratified) return { rows, snapshots, publication: aggregatePublications(used) };

  const drivers = new Map(championship.drivers.map((driver) => [driver.id, driver]));
  const records = new Map(championship.publications.map((round) => [round.raceId, round]));
  const order: readonly ("points" | TieBreak)[] = ["points", ...policy.tieBreaks];
  const compare = (a: ChampionshipRow, b: ChampionshipRow) => order.reduce((value, key) => value || b[key] - a[key], 0);
  let priorPositions = new Map<string, number>();

  for (const round of rounds) {
    const record = records.get(round.id);
    const bulletin = record?.result;
    if (!bulletin || !isPublished(bulletin)) continue;
    used.push(bulletin);
    const pole = isPublished(record.qualification) ? record.qualification?.entries.find(({ position }) => position === 1)?.driverId : undefined;
    for (const entry of bulletin.entries) {
      const driver = drivers.get(entry.driverId);
      if (!driver) continue;
      const row = totals.get(driver.id) ?? {
        driver, position: 0, points: 0, rounds: 0, wins: 0, podiums: 0, poles: 0, finals: 0, deduction: 0, gap: 0, cells: {},
      };
      if (row.cells[round.id]) continue;
      const award = entry.award;
      const earned = pointsToUnits(award ? policy[award.source][award.position] ?? "0" : "0");
      const deduction = pointsToUnits(entry.deduction ?? "0");
      row.points += earned - deduction;
      row.deduction += deduction;
      row.rounds += Number(entry.outcome !== "absent");
      row.wins += Number(entry.finalPosition === 1);
      row.podiums += Number(entry.finalPosition !== undefined && entry.finalPosition >= 1 && entry.finalPosition <= 3);
      row.poles += Number(pole === entry.driverId);
      row.finals += Number(entry.startedFinal === true);
      row.cells[round.id] = { outcome: entry.outcome, earned, deduction };
      totals.set(driver.id, row);
    }
    const ranked = [...totals.values()].sort((a, b) => compare(a, b) || a.driver.id.localeCompare(b.driver.id));
    let position = 0;
    rows = ranked.map((row, index) => {
      if (!index || compare(row, ranked[index - 1]) !== 0) position = index + 1;
      return { ...row, cells: { ...row.cells }, position, previous: priorPositions.get(row.driver.id), gap: ranked[0].points - row.points };
    });
    snapshots[round.id] = rows;
    priorPositions = new Map(rows.map((row) => [row.driver.id, row.position]));
  }
  return { rows, snapshots, publication: aggregatePublications(used) };
}

export function formatLap(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor(milliseconds / 1000) % 60;
  return minutes + ":" + String(seconds).padStart(2, "0") + "." + String(milliseconds % 1000).padStart(3, "0");
}
