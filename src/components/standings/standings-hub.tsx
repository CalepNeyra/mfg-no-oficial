"use client";

import { useSearchParams } from "next/navigation";
import { Flag, Trophy } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, type KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";
import type { Championship, ChampionshipRound, Driver, Publication } from "@/lib/championship";
import { aggregatePublications, buildChampionship, isPublished } from "@/lib/championship-scoring";
import type { Division } from "@/lib/competition";
import { divisionSlugs } from "@/lib/portal";
import { japanTime, type RaceSeason } from "@/lib/race-schedule";
import { regulationHref } from "@/lib/registration/regulations";
import { seriesData } from "@/lib/series";
import { EmptyState } from "../portal-ui";
import { SeriesIdentity } from "../series-identity";
import { StandingsStats } from "./standings-stats";
import { ChampionshipLeaders, Finalists, GeneralTable, PointsMatrix, QualifyingTable, RoundResults } from "./standings-tables";
import { DriverSearch, StandingsExports, StandingsSelect } from "./standings-tools";

const tabs = ["general", "qualifying", "finalists", "points", "statistics"] as const;
type Tab = (typeof tabs)[number];

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function StandingsHub({ seasons, championships, rounds, preview }: {
  seasons: readonly RaceSeason[]; championships: readonly Championship[];
  rounds: readonly (ChampionshipRound & { division: Division; seasonId: string })[]; preview: boolean;
}) {
  const t = useTranslations("championship");
  const portal = useTranslations();
  const format = useFormatter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [gridMode, setGridMode] = useState<"qualification" | "grid">("grid");
  const division = divisionSlugs.find((value) => value === searchParams.get("series")) ?? divisionSlugs[0];
  const tab = tabs.find((value) => value === searchParams.get("tab")) ?? "general";
  const seasonOptions = seasons.filter(({ id }) => rounds.some((round) => round.division === division && round.seasonId === id) ||
    championships.some((item) => item.division === division && item.seasonId === id));
  const season = seasonOptions.find(({ id }) => id === searchParams.get("season")) ??
    seasonOptions.find(({ id }) => id === seriesData[division].currentSeasonId) ?? seasonOptions.at(-1);
  const championship = championships.find((item) => item.division === division && item.seasonId === season?.id);
  const calendar = rounds.filter((round) => round.division === division && round.seasonId === season?.id);
  const roundSelected = calendar.find(({ id }) => id === searchParams.get("round"));
  const ordered = [...calendar].sort((a, b) => a.round - b.round);
  const scope = roundSelected ? ordered.slice(0, ordered.indexOf(roundSelected) + 1) : ordered;
  const round = roundSelected ?? ordered.at(-1);
  const bulletin = championship?.publications.find(({ raceId }) => raceId === round?.id);
  const qualifying = bulletin?.qualification;
  const grid = bulletin?.grid;
  const gridSource = gridMode === "grid" && isPublished(grid) ? "grid" : "qualification";
  const matches = (driver: Driver) => normalize([driver.name, driver.number, driver.vehicle.manufacturer, driver.vehicle.model].join(" ")).includes(normalize(query));
  const derived = championship && buildChampionship(championship, scope);
  const rows = derived?.rows.filter(({ driver }) => matches(driver)) ?? [];
  const roundLabel = tab === "qualifying" || tab === "finalists" ? t("latestRound") : t("allRounds");
  const canQualify = Boolean(championship && qualifying?.entries.length && isPublished(qualifying));
  const canShowGrid = Boolean(grid?.entries.length && isPublished(grid));
  const finalistsPublication = gridSource === "grid" ? grid : qualifying;
  const canShowFinalists = gridSource === "grid" ? canShowGrid : Boolean(canQualify && championship?.qualifyingFormat);
  const publication: Publication = (tab === "qualifying" ? qualifying :
    tab === "finalists" ? finalistsPublication :
    tab === "statistics" && championship ? aggregatePublications([
      ...(derived ? [derived.publication] : []),
      ...championship.publications.filter(({ raceId }) => scope.some(({ id }) => id === raceId))
        .flatMap((item) => item.qualification ? [item.qualification] : []),
    ]) : derived?.publication) ?? { state: "pending" };

  function update(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    if (key === "series") url.searchParams.delete("season");
    if (key === "series" || key === "season") url.searchParams.delete("round");
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  }

  function selectTab(value: Tab) {
    update("tab", value === "general" ? null : value);
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const target = event.key === "ArrowRight" ? (index + 1) % tabs.length :
      event.key === "ArrowLeft" ? (index + last) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? last : undefined;
    if (target === undefined) return;
    event.preventDefault();
    selectTab(tabs[target]);
    document.getElementById("stand-tab-" + tabs[target])?.focus();
  }

  const canShowRows = Boolean(derived?.rows.length);
  const hasStats = Boolean(championship && (canShowRows || scope.some(({ id }) =>
    isPublished(championship.publications.find(({ raceId }) => raceId === id)?.qualification))));
  const empty = <EmptyState icon={Trophy}>{t("empty")}</EmptyState>;
  const noMatches = <EmptyState icon={Flag}>{t("noMatches")}</EmptyState>;

  return <div className="shell stand-content" data-division={division}>
    {preview && <p className="stand-preview stand-no-print">{t("preview")}</p>}
    <div className="stand-division">
      <SeriesIdentity division={division} as="p" />
      <div className="stand-publication">
        <span className="stand-state" data-publication={publication.state}>{t(`publication.${publication.state}`)}</span>
        {publication.updatedAt && isPublished(publication) && (
          <time dateTime={publication.updatedAt}>{t("updated", { date: format.dateTime(new Date(publication.updatedAt), {
            timeZone: japanTime, dateStyle: "medium", timeStyle: "short",
          }) })}</time>
        )}
        {championship?.scoring?.ratified && <span>{t("revision", { version: championship.scoring.revision })}</span>}
        <Link className="text-link" href={regulationHref(division) + "#sporting"}>{t("rules")}</Link>
      </div>
    </div>
    <div className="stand-filters stand-no-print">
      <StandingsSelect id="stand-division" label={t("division")} value={division}
        options={divisionSlugs.map((value) => ({ value, label: "MFG " + portal(`divisions.${value}.title`) }))}
        onChange={(value) => update("series", value)} />
      <StandingsSelect id="stand-season" label={t("season")} value={season?.id ?? "none"}
        options={seasonOptions.length ? seasonOptions.map(({ id, label }) => ({ value: id, label })) : [{ value: "none", label: t("noSeason") }]}
        onChange={(value) => update("season", value === "none" ? null : value)} />
      <StandingsSelect id="stand-round" label={t("round")} value={roundSelected?.id ?? "all"}
        options={[{ value: "all", label: roundLabel }, ...ordered.map(({ id, round: number }) => ({ value: id, label: t("roundLabel", { round: number }) }))]}
        onChange={(value) => update("round", value === "all" ? null : value)} />
      <DriverSearch value={query} onChange={setQuery} />
    </div>
    <div className="stand-tabs stand-no-print" role="tablist" aria-label={t("tabs")}>
      {tabs.map((value, index) => <button type="button" key={value} role="tab" id={"stand-tab-" + value}
        aria-controls="stand-tabpanel" aria-selected={value === tab} tabIndex={value === tab ? 0 : -1}
        onClick={() => selectTab(value)} onKeyDown={(event) => navigateTabs(event, index)}>{t(`tab.${value}`)}</button>)}
    </div>
    <section className="stand-tabpanel" id="stand-tabpanel" role="tabpanel" aria-labelledby={"stand-tab-" + tab} tabIndex={0}>
      <header className="stand-panel-head"><div><h2>{t(`tab.${tab}`)}</h2>
        {season && <p>{season.label}{round && (roundSelected || tab === "qualifying" || tab === "finalists") ? " · " + t("roundLabel", { round: round.round }) : ""}</p>}</div>
        {isPublished(publication) && ((tab === "general" || tab === "points") && rows.length > 0 ||
          tab === "qualifying" && canQualify || tab === "finalists" && canShowFinalists) &&
          <StandingsExports filename={"mfg-" + division + "-" + (season?.id ?? "") + "-" + tab} />}
      </header>
      {tab === "general" && (canShowRows ? rows.length ? <>
        {!query.trim() && <ChampionshipLeaders rows={rows} />}<GeneralTable rows={rows} />
      </> : noMatches : empty)}
      {tab === "qualifying" && (championship && qualifying && canQualify
        ? qualifying.entries.some(({ driverId }) => championship.drivers.some((driver) => driver.id === driverId && matches(driver)))
          ? <QualifyingTable publication={qualifying} championship={championship} matches={matches} /> : noMatches
        : empty)}
      {tab === "finalists" && <>
        {canShowGrid && canQualify && championship?.qualifyingFormat && <div className="stand-grid-mode stand-no-print" role="group" aria-label={t("tab.finalists")}>
          <button type="button" aria-pressed={gridSource === "qualification"} onClick={() => setGridMode("qualification")}>{t("timedSelection")}</button>
          <button type="button" aria-pressed={gridSource === "grid"} onClick={() => setGridMode("grid")}>{t("startingGrid")}</button>
        </div>}
        {championship && canShowFinalists ? <Finalists grid={grid} qualification={isPublished(qualifying) ? qualifying : undefined}
          championship={championship} matches={matches} source={gridSource} /> : empty}
      </>}
      {tab === "points" && <>
        {canShowRows ? rows.length ? <PointsMatrix rows={rows} rounds={ordered} activeRound={roundSelected?.id} onRound={(id) => update("round", id)} /> : noMatches : empty}
        {roundSelected && championship && bulletin?.result && isPublished(bulletin.result) &&
          <RoundResults publication={bulletin.result} drivers={championship.drivers} round={roundSelected} matches={matches} />}
      </>}
      {tab === "statistics" && (championship && derived && hasStats ? <StandingsStats key={division + season?.id} championship={championship}
        rows={derived.rows} rounds={scope} snapshots={derived.snapshots} matches={matches} /> : empty)}
    </section>
  </div>;
}
