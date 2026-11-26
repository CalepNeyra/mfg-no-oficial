import { useFormatter, useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import type { ReactNode } from "react";
import type { Driver, ResultEntry } from "@/lib/championship";
import { formatLap } from "@/lib/championship-scoring";
import { podiumEntries, type PublishedSession } from "@/lib/race-results";
import { MediaSlot } from "../portal-ui";
import { DriverName, usePointText, VehicleName } from "../standings/standings-fields";

const missing = "—";
const outcomeCodes = { absent: "DNS", retired: "DNF", disqualified: "DSQ" } as const;

function RaceTable({ title, columns, children }: { title: string; columns: readonly string[]; children: ReactNode }) {
  return <div className="results-table-scroll" role="region" aria-label={title} tabIndex={0}>
    <table>
      <caption className="sr-only">{title}</caption>
      <thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>;
}

function ResultStatus({ outcome }: { outcome: keyof typeof outcomeCodes | "participated" }) {
  const t = useTranslations("championship.outcome");
  return outcome === "participated" ? <span className="results-code" data-outcome={outcome}>{t(outcome)}</span>
    : <abbr className="results-code" data-outcome={outcome} title={t(outcome)} aria-label={t(outcome)}>{outcomeCodes[outcome]}</abbr>;
}

function entryTime(milliseconds?: number) {
  return milliseconds === undefined ? missing : formatLap(milliseconds);
}

export function RaceResultsTable({ session, drivers, title }: {
  session: PublishedSession; drivers: readonly Driver[]; title: string;
}) {
  const t = useTranslations("championship");
  const result = useTranslations("raceResults");
  const points = usePointText();
  const format = useFormatter();
  const byId = new Map(drivers.map((driver) => [driver.id, driver]));
  const common = [t("field.pos"), t("field.number"), t("field.driver"), t("field.vehicle")];
  function gap(time?: number, leader?: number) {
    return time === undefined || leader === undefined ? missing :
      (time < leader ? "−" : "+") + format.number(Math.abs(time - leader) / 1000, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }

  if (session.kind === "timed") {
    const entries = [...session.bulletin.entries].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
    const leader = entries.find(({ position, outcome }) => position === 1 && (!outcome || outcome === "participated"))?.milliseconds;
    return <RaceTable title={title} columns={[...common, t("field.best"), t("field.leaderGap"), t("field.zone")]}>
      {entries.map((entry) => {
        const driver = byId.get(entry.driverId);
        if (!driver) return null;
        const { position, milliseconds, outcome } = entry;
        const rules = session.format;
        const zone = entry.qualificationStatus ?? (rules && position !== undefined && (position <= rules.finalPlaces ? "final" :
          rules.pointPlaces === undefined ? undefined : position <= rules.pointPlaces ? "points" : "outside"));
        return <tr key={driver.id} data-first={position === 1 || undefined}>
          <td>{position ?? missing}</td><td><span className="results-bib">{driver.number}</span></td>
          <th scope="row"><DriverName driver={driver} portrait={false} /></th><td><VehicleName driver={driver} /></td>
          <td className="results-time">{entryTime(milliseconds)}</td><td className="results-time">{position === 1 ? missing : gap(milliseconds, leader)}</td>
          <td>{outcome && outcome !== "participated" ? <ResultStatus outcome={outcome} /> : zone ? t(`zone.${zone}`) : missing}</td>
        </tr>;
      })}
    </RaceTable>;
  }

  const entries = [...session.bulletin.entries].sort((a, b) => (a.finalPosition ?? Infinity) - (b.finalPosition ?? Infinity));
  const winner = entries.find(({ finalPosition, outcome }) => finalPosition === 1 && outcome !== "disqualified" && outcome !== "absent")?.milliseconds;
  return <RaceTable title={title} columns={[...common, result("totalTime"), result("winnerGap"), result("penalties"), t("field.outcome"), t("field.points")]}>
    {entries.map((entry) => {
      const driver = byId.get(entry.driverId);
      if (!driver) return null;
      const { finalPosition, milliseconds, gapMilliseconds, lapsBehind, penalties, deduction, outcome } = entry;
      const winnerGap = finalPosition === 1 ? missing : lapsBehind
        ? result("lapsBehind", { laps: lapsBehind }) : gapMilliseconds !== undefined ? gap(gapMilliseconds, 0) : gap(milliseconds, winner);
      const netPoints = session.points[entry.driverId];
      return <tr key={driver.id} data-first={finalPosition === 1 || undefined}>
        <td>{finalPosition ?? missing}</td><td><span className="results-bib">{driver.number}</span></td>
        <th scope="row"><DriverName driver={driver} portrait={false} /></th><td><VehicleName driver={driver} /></td>
        <td className="results-time">{entryTime(milliseconds)}</td><td className="results-time">{winnerGap}</td>
        <td>{penalties?.length ? <ul className="results-penalties">{penalties.map((penalty, index) => <li key={index}>{penalty}</li>)}</ul> : null}
          {deduction ? <span>{result("pointsDeducted", { points: deduction })}</span> : penalties?.length ? null : missing}</td>
        <td><ResultStatus outcome={outcome} /></td><td><strong>{typeof netPoints === "number" ? points(netPoints) : missing}</strong></td>
      </tr>;
    })}
  </RaceTable>;
}

export function RacePodium({ entries, drivers }: { entries: readonly ResultEntry[]; drivers: readonly Driver[] }) {
  const t = useTranslations("raceResults");
  const places = podiumEntries(entries, drivers);
  if (!places.length) return null;

  return <section className="results-podium" aria-labelledby="results-podium-title">
    <h2 id="results-podium-title">{t("podium")}</h2>
    <ol>
      {places.map(({ position, driver, entry }) => <li key={driver.id} data-position={position}>
        <div className="results-podium-photo">
          {driver.photograph ? <MediaSlot variant="editorial" image={driver.photograph} sizes="(max-width: 620px) 55vw, 25vw" />
            : <Camera size={26} aria-hidden="true" />}
          <span className="results-podium-rank" aria-label={t("position", { position })}>{position}</span>
          <span className="results-bib">{driver.number}</span>
        </div>
        <div className="results-podium-copy">
          <h3><DriverName driver={driver} portrait={false} /></h3>
          <p><VehicleName driver={driver} /></p>
          {entry.milliseconds !== undefined && <strong className="results-time">{entryTime(entry.milliseconds)}</strong>}
        </div>
      </li>)}
    </ol>
  </section>;
}
