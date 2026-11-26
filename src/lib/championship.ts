import type { PortalImage } from "@/components/portal-ui";
import type { Division } from "./competition";
import type { Locale } from "@/i18n/routing";

export const publicationStates = ["pending", "provisional", "review", "final", "corrected"] as const;
export type PublicationState = (typeof publicationStates)[number];
export type Publication = { state: PublicationState; updatedAt?: string };
export type Bulletin<T> = Publication & { entries: readonly T[] };
export const outcomes = ["participated", "absent", "retired", "disqualified"] as const;
export type Outcome = (typeof outcomes)[number];
export type Driver = {
  id: string; name: string; number: string; countryCode?: string; photograph?: PortalImage; href?: string;
  vehicle: { manufacturer: string; model: string; href?: string };
};
export type TimedEntry = {
  driverId: string; position?: number; milliseconds?: number; day?: string;
  outcome?: Outcome; qualificationStatus?: "final" | "points" | "outside";
};
export type GridEntry = { driverId: string; position: number };
export type ResultEntry = {
  driverId: string;
  outcome: Outcome;
  // The published sporting decision selects one scoring source, including after penalties.
  award: { source: "final" | "qualifying"; position: number } | null;
  finalPosition?: number;
  startedFinal?: boolean;
  deduction?: string;
  milliseconds?: number;
  gapMilliseconds?: number;
  lapsBehind?: number;
  penalties?: readonly string[];
};
export type HistoryEntry = Publication & { revision: string; reason?: string };
export type RoundPublication = {
  raceId: string;
  qualification?: Bulletin<TimedEntry> & { ghostReferenceMs?: number };
  grid?: Bulletin<GridEntry>;
  result?: Bulletin<ResultEntry>;
  additionalSessions?: Readonly<Record<string, Bulletin<TimedEntry>>>;
  history?: readonly HistoryEntry[];
};
export type TieBreak = "wins" | "podiums" | "poles" | "finals";
export type ScoringPolicy = {
  revision: string;
  ratified: boolean;
  final: Readonly<Record<number, string>>;
  qualifying: Readonly<Record<number, string>>;
  tieBreaks: readonly TieBreak[];
};
export type Championship = {
  division: Division;
  seasonId: string;
  scoring?: ScoringPolicy;
  qualifyingFormat?: { finalPlaces: number; pointPlaces?: number };
  // Declare only additional sessions admitted by this season's applicable regulations.
  additionalSessions?: readonly { id: string; names: Readonly<Record<Locale, string>> }[];
  drivers: readonly Driver[];
  publications: readonly RoundPublication[];
};
export type ChampionshipRound = { id: string; round: number; title: string; href?: string };
export type PointsCell = { outcome: Outcome; earned: number; deduction: number };
export type ChampionshipRow = {
  driver: Driver;
  position: number;
  previous?: number;
  points: number;
  rounds: number;
  wins: number;
  podiums: number;
  poles: number;
  finals: number;
  deduction: number;
  gap: number;
  cells: Record<string, PointsCell>;
};
