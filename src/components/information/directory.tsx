"use client";

import { MapPin, Search, UsersRound } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { PublicCircuitSummary, PublicDriverSummary } from "@/lib/public-information";
import { divisionSlugs } from "@/lib/portal";
import type { RaceSeason } from "@/lib/race-schedule";
import { MFGSelect } from "../mfg-select";
import { EmptyState, MediaSlot } from "../portal-ui";

function searchKey(value: string) {
  return value.normalize("NFKC").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function DriverCard({ record }: { record: PublicDriverSummary }) {
  const t = useTranslations();
  const locale = useLocale();
  const country = record.countryCode && /^[A-Z]{2}$/.test(record.countryCode)
    ? new Intl.DisplayNames(locale, { type: "region" }).of(record.countryCode) : undefined;

  return <article className="info-directory-card" data-division={record.division}>
    <div className="info-card-picture">
      <MediaSlot variant="editorial" image={record.photograph} sizes="(max-width: 620px) 100vw, 33vw" />
      <span className="info-bib">#{record.number}</span>
    </div>
    <div className="info-card-body">
      <p className="overline">{t(`divisions.${record.division}.title`)}</p>
      <h2><Link href={`/drivers/${encodeURIComponent(record.slug)}`}>{record.name}</Link></h2>
      {country && <p>{country}</p>}
      {(record.manufacturer || record.model) && <p>{[record.manufacturer, record.model].filter(Boolean).join(" ")}</p>}
      <Link className="text-link" href={`/drivers/${encodeURIComponent(record.slug)}`}>{t("information.profile")}</Link>
    </div>
  </article>;
}

function CircuitCard({ record }: { record: PublicCircuitSummary }) {
  const t = useTranslations();
  const format = useFormatter();
  return <article className="info-directory-card" data-division={record.divisions.length === 1 ? record.divisions[0] : undefined}>
    <MediaSlot variant="circuit" image={record.image} sizes="(max-width: 620px) 100vw, 33vw" />
    <div className="info-card-body">
      {record.divisions.length > 0 && <p className="overline">{record.divisions.map((division) => t(`divisions.${division}.title`)).join(" · ")}</p>}
      <h2><Link href={`/circuits/${encodeURIComponent(record.slug)}`}>{record.name}</Link></h2>
      {record.location && <p>{record.location}</p>}
      {record.lengthKm !== undefined && <p>{format.number(record.lengthKm, { style: "unit", unit: "kilometer" })}</p>}
      <Link className="text-link" href={`/circuits/${encodeURIComponent(record.slug)}`}>{t("information.circuitDetails")}</Link>
    </div>
  </article>;
}

type Props = { kind: "drivers"; records: readonly PublicDriverSummary[]; seasons: readonly RaceSeason[] } |
  { kind: "circuits"; records: readonly PublicCircuitSummary[] };

export function InformationDirectory(props: Props) {
  const t = useTranslations();
  const params = useSearchParams();
  const division = divisionSlugs.find((item) => item === params.get("series"));
  const query = (params.get("q") ?? "").slice(0, 100);
  const seasons = props.kind === "drivers" ? props.seasons : [];
  const season = seasons.find((item) => item.id === params.get("season"));
  const driverList = props.kind === "drivers" ? props.records.filter((driver) =>
    (!division || driver.division === division) && (!season || driver.seasons.includes(season.id)) &&
    searchKey(`${driver.name} ${driver.number}`).includes(searchKey(query.trim().replace(/^#/, "")))) : [];
  const circuitList = props.kind === "circuits" ? props.records.filter((circuit) =>
    (!division || circuit.divisions.includes(division))) : [];

  function update(key: string, value: string, replace = false) {
    const url = new URL(window.location.href);
    if (value && (key === "q" || value !== "all")) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (url.href !== window.location.href) {
      if (replace) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    }
  }

  const hasResults = driverList.length > 0 || circuitList.length > 0;
  const filtered = division || season || (props.kind === "drivers" && query.trim());
  return <div className="shell info-content">
    <div className="info-filters">
      <div>
        <label htmlFor="info-division">{t("championship.division")}</label>
        <MFGSelect id="info-division" value={division ?? "all"} onValueChange={(value) => update("series", value)}
          placeholder={t("championship.division")} options={[{ value: "all", label: t("schedule.allDivisions") },
            ...divisionSlugs.map((value) => ({ value, label: t(`divisions.${value}.title`) }))]} />
      </div>
      {props.kind === "drivers" && <>
        <div>
          <label htmlFor="info-season">{t("championship.season")}</label>
          <MFGSelect id="info-season" value={season?.id ?? "all"} onValueChange={(value) => update("season", value)}
            placeholder={t("championship.season")} options={[{ value: "all", label: t("schedule.allSeasons") },
              ...seasons.map(({ id, label }) => ({ value: id, label }))]} />
        </div>
        <div>
          <label htmlFor="info-search">{t("championship.search")}</label>
          <div className="info-search">
            <Search size={16} aria-hidden="true" />
            <input id="info-search" type="search" value={query} maxLength={100}
              onChange={(event) => update("q", event.target.value, true)} placeholder={t("information.driverSearch")} />
          </div>
        </div>
      </>}
    </div>
    <div aria-live="polite">
      {hasResults ? <div className="info-directory-grid">
        {driverList.map((record) => <DriverCard key={record.slug} record={record} />)}
        {circuitList.map((record) => <CircuitCard key={record.slug} record={record} />)}
      </div> : <div className="info-empty">
        <EmptyState icon={props.kind === "drivers" ? UsersRound : MapPin}>{filtered && props.records.length
          ? t("information.noMatches") : t(props.kind === "drivers" ? "sections.drivers.empty" : "information.circuitsEmpty")}</EmptyState>
        <Link className="text-link" href={props.kind === "drivers" ? "/standings" : "/calendar"}>
          {t(props.kind === "drivers" ? "home.standingsLink" : "home.calendarLink")}
        </Link>
      </div>}
    </div>
  </div>;
}
