import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Bulletin, Championship, ChampionshipRound, ChampionshipRow, Driver, GridEntry, ResultEntry, TimedEntry } from "@/lib/championship";
import { formatLap } from "@/lib/championship-scoring";
import { MediaSlot } from "../portal-ui";
import { DriverName, Nationality, PositionChange, StandingsTable, usePointText, VehicleName } from "./standings-fields";

const generalKeys = ["pos", "driver", "change", "number", "country", "vehicle", "rounds", "wins", "podiums", "points", "gap"] as const;

export function GeneralTable({ rows }: { rows: readonly ChampionshipRow[] }) {
  const t = useTranslations("championship");
  const points = usePointText();
  return <StandingsTable className="stand-general" columns={generalKeys.map((key) => ({ short: t(`short.${key}`), full: t(`field.${key}`) }))} label={t("tab.general")}>
    {rows.map((row) => <tr key={row.driver.id}><td>{row.position}</td>
      <th scope="row"><DriverName driver={row.driver} /></th>
      <td><PositionChange current={row.position} previous={row.previous} /></td>
      <td>{row.driver.number}</td><td><Nationality code={row.driver.countryCode} /></td><td><VehicleName driver={row.driver} /></td>
      <td>{row.rounds}</td><td>{row.wins}</td><td>{row.podiums}</td><td><strong>{points(row.points)}</strong></td>
      <td>{row.gap ? "−" + points(row.gap) : "—"}</td>
    </tr>)}
  </StandingsTable>;
}

export function ChampionshipLeaders({ rows }: { rows: readonly ChampionshipRow[] }) {
  const t = useTranslations("championship");
  const points = usePointText();
  if (!rows.length) return null;
  return <section className="stand-leaders stand-no-print" aria-labelledby="standing-leaders-title">
    <h3 id="standing-leaders-title">{t("leaders")}</h3>
    <div className="stand-leader-grid">
      {rows.slice(0, 3).map(({ driver, position, points: total, wins }, index) => <article key={driver.id} data-leader={index === 0}>
        <div className="stand-leader-rank"><strong>{position}</strong><span>{t("bib", { number: driver.number })}</span></div>
        {driver.photograph && <MediaSlot variant="editorial" image={driver.photograph} />}
        <h4><DriverName driver={driver} portrait={false} /></h4>
        <p><Nationality code={driver.countryCode} /> · <VehicleName driver={driver} /></p>
        <dl><div><dt>{t("field.points")}</dt><dd>{points(total)}</dd></div><div><dt>{t("field.wins")}</dt><dd>{wins}</dd></div></dl>
      </article>)}
    </div>
  </section>;
}

function zoneAt(position: number, format?: Championship["qualifyingFormat"]) {
  if (!format) return undefined;
  if (position <= format.finalPlaces) return "final";
  return format.pointPlaces === undefined ? undefined : position <= format.pointPlaces ? "points" : "outside";
}

export function QualifyingTable({ publication, championship, matches }: {
  publication: Bulletin<TimedEntry> & { ghostReferenceMs?: number }; championship: Championship; matches: (driver: Driver) => boolean;
}) {
  const t = useTranslations("championship");
  const format = useFormatter();
  const drivers = new Map(championship.drivers.map((driver) => [driver.id, driver]));
  const sorted = [...publication.entries].sort((a, b) => a.position - b.position);
  const top = sorted[0]?.milliseconds;
  const rules = championship.qualifyingFormat;
  const zones: { code: "final" | "points" | "outside"; range: string }[] = [];
  if (rules) {
    zones.push({ code: "final", range: "1–" + rules.finalPlaces });
    if (rules.pointPlaces !== undefined) {
      if (rules.pointPlaces > rules.finalPlaces) zones.push({ code: "points", range: (rules.finalPlaces + 1) + "–" + rules.pointPlaces });
      zones.push({ code: "outside", range: (rules.pointPlaces + 1) + "+" });
    }
  }
  const field = (key: string) => t(`field.${key}`);
  const delta = (time?: number, baseline?: number) => time !== undefined && baseline !== undefined
    ? (time >= baseline ? "+" : "−") + format.number(Math.abs(time - baseline) / 1000, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : "—";

  return <>
    {publication.ghostReferenceMs !== undefined && <p className="stand-ghost">{t("ghost", { time: formatLap(publication.ghostReferenceMs) })}</p>}
    {zones.length > 0 && <div className="stand-zone-legend">
      {zones.map(({ code, range }) => <span key={code} className="stand-state" data-zone={code}>{range} · {t("zone." + code)}</span>)}
    </div>}
    <StandingsTable className="stand-qualifying" columns={["pos", "driver", "number", "country", "vehicle", "best", "leaderGap", "previousGap", "day", "zone"].map((key) => key === "pos" ? { short: t("short.pos"), full: field(key) } : field(key))} label={t("tab.qualifying")}>
      {sorted.map(({ driverId, position, milliseconds, day }, index) => {
        const driver = drivers.get(driverId);
        if (!driver || !matches(driver)) return null;
        const zone = zoneAt(position, championship.qualifyingFormat);
        const boundary = zone && (position === (championship.qualifyingFormat?.finalPlaces ?? -2) + 1 ||
          position === (championship.qualifyingFormat?.pointPlaces ?? -2) + 1);
        return <tr key={driverId} data-zone={zone} data-boundary={boundary || undefined}>
          <td>{position}</td><th scope="row"><DriverName driver={driver} /></th><td>{driver.number}</td>
          <td><Nationality code={driver.countryCode} /></td><td><VehicleName driver={driver} /></td>
          <td><strong>{milliseconds === undefined ? "—" : formatLap(milliseconds)}</strong></td>
          <td>{position === 1 ? "—" : delta(milliseconds, top)}</td>
          <td>{delta(milliseconds, sorted[index-1]?.milliseconds)}</td>
          <td>{day ? <time dateTime={day}>{format.dateTime(new Date(day + "T00:00:00Z"), { month: "short", day: "numeric", timeZone: "UTC" })}</time> : "—"}</td>
          <td>{zone ? <span className="stand-state" data-zone={zone}>{t(`zone.${zone}`)}</span> : "—"}</td>
        </tr>;
      })}
    </StandingsTable>
  </>;
}

export function Finalists({ grid, qualification, championship, matches, source }: {
  grid?: Bulletin<GridEntry>; qualification?: Bulletin<TimedEntry>; championship: Championship;
  matches: (driver: Driver) => boolean; source: "grid" | "qualification";
}) {
  const t = useTranslations("championship");
  const drivers = new Map(championship.drivers.map((driver) => [driver.id, driver]));
  const qualifying = new Map(qualification?.entries.map((entry) => [entry.driverId, entry]));
  const entries = source === "grid" ? grid?.entries : qualification?.entries.filter(({ position }) =>
    championship.qualifyingFormat && position <= championship.qualifyingFormat.finalPlaces);
  const finalists = [...(entries ?? [])].sort((a, b) => a.position - b.position).flatMap(({ position, driverId }) => {
    const driver = drivers.get(driverId);
    return driver && matches(driver) ? [{ position, driver, time: qualifying.get(driverId)?.milliseconds }] : [];
  });
  return <div className="stand-finalists">
    {championship.qualifyingFormat?.finalPlaces === 15 && <p className="stand-godly"><strong>神15</strong><span>Godly Fifteen</span></p>}
    <p className="stand-finalist-note">{t(source === "grid" ? "gridNote" : "provisionalNote")}</p>
    <div className="stand-finalist-grid">
      {finalists.map(({ position, driver, time }) => <article key={driver.id}>
          <div className="stand-finalist-meta"><strong>{position}</strong><span>{t("bib", { number: driver.number })}</span>
            <Nationality code={driver.countryCode} /></div>
          {driver.photograph && <MediaSlot variant="editorial" image={driver.photograph} />}
          <h3><DriverName driver={driver} portrait={false} /></h3>
          <p><VehicleName driver={driver} /></p>
          <p className="stand-lap">{time === undefined ? "—" : formatLap(time)}</p>
        </article>)}
    </div>
    {!finalists.length && <p className="stand-empty">{t("noMatches")}</p>}
    <div className="sr-only" aria-hidden="true">
      <table data-csv><thead><tr>{["pos", "number", "country", "driver", "vehicle", "best"].map((key) =>
        <th key={key}>{t(`field.${key}`)}</th>)}</tr></thead>
      <tbody>{finalists.map(({ position, driver, time }) => <tr key={driver.id}>
        <td>{position}</td><td>{driver.number}</td><td>{driver.countryCode}</td><td>{driver.name}</td>
        <td>{driver.vehicle.manufacturer} {driver.vehicle.model}</td><td>{time === undefined ? "—" : formatLap(time)}</td>
      </tr>)}</tbody></table>
    </div>
  </div>;
}

export function PointsMatrix({ rows, rounds, activeRound, onRound }: {
  rows: readonly ChampionshipRow[]; rounds: readonly ChampionshipRound[]; activeRound?: string; onRound: (id: string) => void;
}) {
  const t = useTranslations("championship");
  const points = usePointText();
  const label = t("tab.points");
  return <div className="stand-table-scroll" role="region" aria-label={label} tabIndex={0}>
    <table className="stand-points" aria-label={label} data-csv>
      <thead><tr><th scope="col">{t("short.pos")}</th><th scope="col">{t("short.driver")}</th><th scope="col">{t("short.number")}</th>
        {rounds.map((round) => <th key={round.id} scope="col"><button type="button" title={round.title} aria-pressed={activeRound === round.id} onClick={() => onRound(round.id)}>{t("roundLabel", { round: round.round })}</button></th>)}
        <th scope="col">{t("field.deduction")}</th><th scope="col">{t("field.points")}</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.driver.id}><td>{row.position}</td><th scope="row"><DriverName driver={row.driver} portrait={false} /></th>
        <td>{row.driver.number}</td>
        {rounds.map(({ id }) => {
          const cell = row.cells[id];
          return <td key={id} data-outcome={cell?.outcome}>{cell
            ? <><span>{points(cell.earned)}</span><small>{t(`outcome.${cell.outcome}`)}</small></> : "—"}</td>;
        })}
        <td>{row.deduction ? "−" + points(row.deduction) : "—"}</td><td><strong>{points(row.points)}</strong></td></tr>)}</tbody>
    </table>
  </div>;
}

export function RoundResults({ publication, drivers, round, matches }: {
  publication: Bulletin<ResultEntry>; drivers: readonly Driver[]; round: ChampionshipRound; matches: (driver: Driver) => boolean;
}) {
  const t = useTranslations("championship");
  const byId = new Map(drivers.map((driver) => [driver.id, driver]));
  const entries = [...publication.entries].sort((a, b) => (a.finalPosition ?? Infinity) - (b.finalPosition ?? Infinity));
  return <section className="stand-round-result" id="stand-round-details">
    <h3>{t("roundResults")} · {t("roundLabel", { round: round.round })}</h3>
    {round.href && <Link className="text-link" href={round.href}>{t("eventInfo")}</Link>}
    <StandingsTable columns={["pos","driver","number","vehicle","outcome","deduction"].map((key) => key === "pos" ? { short: t("short.pos"), full: t("field.pos") } : t(`field.${key}`))} label={t("roundResults")}>
      {entries.map((entry) => {
        const driver = byId.get(entry.driverId);
        if (!driver || !matches(driver)) return null;
        return <tr key={entry.driverId}><td>{entry.finalPosition ?? "—"}</td>
          <th scope="row"><DriverName driver={driver} /></th><td>{driver.number}</td>
          <td><VehicleName driver={driver} /></td><td>{t(`outcome.${entry.outcome}`)}</td><td>{entry.deduction ?? "—"}</td></tr>;
      })}
    </StandingsTable>
  </section>;
}
