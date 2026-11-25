import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Championship, ChampionshipRound, ChampionshipRow, Driver } from "@/lib/championship";
import { formatLap, isPublished } from "@/lib/championship-scoring";
import { MFGSelect } from "../mfg-select";
import { usePointText } from "./standings-fields";

const metrics = ["points", "position", "gap", "comparisonGap", "qualifying", "wins", "podiums", "poles", "finals"] as const;

export function StandingsStats({ championship, rows, rounds, snapshots, matches }: {
  championship: Championship; rows: readonly ChampionshipRow[]; rounds: readonly ChampionshipRound[];
  snapshots: Record<string, ChampionshipRow[]>; matches: (driver: Driver) => boolean;
}) {
  const t = useTranslations("championship");
  const points = usePointText();
  const [primary, setPrimary] = useState("");
  const [comparison, setComparison] = useState("none");
  const [metric, setMetric] = useState<(typeof metrics)[number]>("points");
  const drivers = (rows.length ? rows.map(({ driver }) => driver) : championship.drivers).filter(matches);
  const selected = drivers.find(({ id }) => id === primary) ?? drivers[0];
  const compare = drivers.find(({ id }) => id === comparison && id !== selected?.id);
  if (!selected) return <p>{t("noMatches")}</p>;

  const options = drivers.map(({ id, name, number }) => ({ value: id, label: number + " · " + name }));
  const subjects = compare ? [selected, compare] : [selected];
  const values = rounds.map((round) => {
    const timed = championship.publications.find(({ raceId }) => raceId === round.id)?.qualification;
    return { round, stats: subjects.map((driver) => {
      if (metric === "qualifying") return isPublished(timed) ? timed?.entries.find(({ driverId }) => driverId === driver.id)?.milliseconds : undefined;
      const snapshot = snapshots[round.id];
      const current = snapshot?.find(({ driver: item }) => item.id === driver.id);
      if (metric === "comparisonGap") {
        const opponent = subjects.find(({ id }) => id !== driver.id);
        const other = snapshot?.find(({ driver: item }) => item.id === opponent?.id);
        return current && other ? current.points - other.points : undefined;
      }
      return current?.[metric];
    }) };
  });
  const numbers = values.flatMap(({ stats }) => stats.filter((value): value is number => value !== undefined));
  const max = Math.max(1, ...numbers);
  const min = Math.min(0, ...numbers);
  const betterLow = metric === "qualifying" || metric === "position";
  const score = (value: number) => betterLow ? (max - value + 1) / (max - Math.min(...numbers) + 1) :
    (value - min) / (max - min);
  const display = (value: number) => metric === "qualifying" ? formatLap(value) :
    metric === "points" || metric === "gap" || metric === "comparisonGap" ? points(value) : String(value);

  return <div className="stand-stats">
    <div className="stand-stats-filters">
      <div><label htmlFor="stats-driver">{t("field.driver")}</label><MFGSelect id="stats-driver" value={selected.id}
        options={options} placeholder={t("field.driver")} onValueChange={setPrimary} /></div>
      <div><label htmlFor="stats-compare">{t("compare")}</label><MFGSelect id="stats-compare" value={compare?.id ?? "none"}
        options={[{ value: "none", label: t("noComparison") }, ...options.filter(({ value }) => selected.id !== value)]}
        placeholder={t("compare")} onValueChange={setComparison} /></div>
      <div><label htmlFor="stats-metric">{t("metricLabel")}</label><MFGSelect id="stats-metric" value={metric}
        options={metrics.map((value) => ({ value, label: t(`metric.${value}`) }))}
        placeholder={t("metricLabel")} onValueChange={(value) => setMetric(metrics.find((item) => item === value) ?? "points")} /></div>
    </div>
    {numbers.length ? <figure className="stand-chart">
      <figcaption>{t(`metric.${metric}`)}</figcaption>
      <ul className="stand-chart-legend">{subjects.map((driver, index) => <li key={driver.id} data-subject={index}>{driver.name}</li>)}</ul>
      {values.map(({ round, stats }) => <div className="stand-chart-round" key={round.id}>
        <strong>{t("roundLabel", { round: round.round })}</strong>
        <ul>{stats.map((value, index) => <li key={subjects[index].id}>
          <span className="sr-only">{subjects[index].name}</span>
          <span className="stand-chart-bar" data-subject={index} aria-hidden="true"
            style={{ width: value === undefined ? "0%" : Math.max(0, score(value) * 100) + "%" }} />
          <strong>{value === undefined ? "—" : display(value)}</strong>
        </li>)}</ul>
      </div>)}
    </figure> : <p className="stand-empty">{t(metric === "comparisonGap" && !compare ? "noComparison" : "empty")}</p>}
  </div>;
}
