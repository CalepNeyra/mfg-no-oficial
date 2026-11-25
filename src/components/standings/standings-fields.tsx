import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Driver } from "@/lib/championship";
import { pointScale } from "@/lib/championship-scoring";
import { MediaSlot } from "../portal-ui";

export function usePointText() {
  const format = useFormatter();
  return (value: number) => format.number(value / pointScale, { minimumFractionDigits: 1, maximumFractionDigits: 3 });
}

export function Nationality({ code }: { code?: string }) {
  const locale = useLocale();
  if (!code || !/^[A-Z]{2}$/.test(code)) return "—";
  const name = new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  return <span className="stand-country" title={name}><span aria-hidden="true"><span className={"fi fi-" + code.toLowerCase()} /> {code}</span><span className="sr-only">{name}</span></span>;
}

export function DriverName({ driver, portrait = true }: { driver: Driver; portrait?: boolean }) {
  return <span className="stand-driver">
    {portrait && driver.photograph && <MediaSlot variant="editorial" image={driver.photograph} sizes="40px" />}
    {driver.href ? <Link href={driver.href}>{driver.name}</Link> : <span>{driver.name}</span>}
  </span>;
}

export function VehicleName({ driver }: { driver: Driver }) {
  const { manufacturer, model } = driver.vehicle;
  return driver.href ? <Link href={driver.href + "#vehicle"}>{manufacturer} {model}</Link> : <>{manufacturer} {model}</>;
}

export function PositionChange({ current, previous }: { current: number; previous?: number }) {
  const t = useTranslations("championship");
  if (previous === undefined) return <span title={t("noPrevious")}>—</span>;
  const difference = previous - current;
  const Icon = difference > 0 ? ArrowUp : difference < 0 ? ArrowDown : Minus;
  const state = difference > 0 ? "gain" : difference < 0 ? "loss" : "steady";
  const text = Math.abs(difference);
  return <span className="stand-change" data-change={state} aria-label={t(state, { count: text })}>
    <Icon size={14} aria-hidden="true" />{difference !== 0 && text}
  </span>;
}

export function StandingsTable({ columns, children, label, className }: {
  columns: readonly (string | { short: string; full: string })[]; children: ReactNode; label: string; className?: string;
}) {
  return <div className="stand-table-scroll" role="region" aria-label={label} tabIndex={0}>
    <table className={className} aria-label={label} data-csv>
      <thead><tr>{columns.map((column, index) => typeof column === "string"
        ? <th key={index} scope="col">{column}</th>
        : <th key={index} scope="col"><abbr title={column.full}>{column.short}</abbr></th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>;
}
