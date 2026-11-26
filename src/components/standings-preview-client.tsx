"use client";

import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import type { Division, Standing } from "@/lib/competition";
import { divisionSlugs } from "@/lib/portal";
import { EmptyState, MediaSlot } from "./portal-ui";

const columns = ["position", "number", "driver", "car", "points"] as const;

function StandingsTable({ division, rows, preview = false }: { division: Division; rows: readonly Standing[]; preview?: boolean }) {
  const t = useTranslations();
  const labels = preview ? ["position", "number", "portrait", "driver", "nationality", "car", "points"] as const : columns;
  return (
    <table className="standings-table" data-preview={preview || undefined} aria-label={t("standings.table", { series: t(`divisions.${division}.title`) })}>
      <thead>
        <tr>{labels.map((label) => <th key={label} scope="col">{t(`standings.${label}`)}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row) => (
          <tr key={row.number}>
            <td>{row.position}</td><td>{row.number}</td>
            {preview && <td>{row.portrait && <MediaSlot variant="editorial" image={row.portrait} sizes="40px" />}</td>}
            <td>{row.driver}</td>{preview && <td>{row.nationality}</td>}<td>{row.car}</td><td>{row.points}</td>
          </tr>
        )) : <tr><td colSpan={labels.length}><EmptyState icon={Trophy}>{t("sections.standings.empty")}</EmptyState></td></tr>}
      </tbody>
    </table>
  );
}

export function StandingsPreviewClient({ division, preview = false, rows }: { division?: Division; preview?: boolean; rows: Partial<Record<Division, readonly Standing[]>> }) {
  const t = useTranslations();
  const [active, setActive] = useState<Division>("super-series");
  const id = useId();

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = divisionSlugs.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % divisionSlugs.length; break;
      case "ArrowLeft": next = (index + last) % divisionSlugs.length; break;
      case "Home": next = 0; break;
      case "End": next = last; break;
      default: return;
    }
    event.preventDefault();
    const division = divisionSlugs[next];
    setActive(division);
    document.getElementById(`${id}-tab-${division}`)?.focus();
  }

  if (division) {
    return <div className="standings standings-scoped" tabIndex={0}
      role="region" aria-label={t("standings.table", { series: t(`divisions.${division}.title`) })}>
      <StandingsTable division={division} rows={rows[division] ?? []} preview={preview} />
    </div>;
  }

  return (
    <div className="standings">
      <div className="standings-tabs" role="tablist" aria-label={t("standings.tabs")}>
        {divisionSlugs.map((division, index) => (
          <button type="button" key={division} role="tab" id={`${id}-tab-${division}`}
            aria-controls={`${id}-panel-${division}`} aria-selected={active === division}
            tabIndex={active === division ? 0 : -1} onClick={() => setActive(division)}
            onKeyDown={(event) => handleKey(event, index)}>{t(`divisions.${division}.title`)}</button>
        ))}
      </div>
      {divisionSlugs.map((division) => (
        <div key={division} role="tabpanel" id={`${id}-panel-${division}`}
          aria-labelledby={`${id}-tab-${division}`} tabIndex={0} hidden={active !== division}>
          <StandingsTable division={division} rows={rows[division] ?? []} preview={preview} />
        </div>
      ))}
    </div>
  );
}
