import { previewChampionship } from "@/lib/championship-data";
import type { Division, Standing } from "@/lib/competition";
import { divisionSlugs } from "@/lib/portal";
import { seriesData } from "@/lib/series";
import { StandingsPreviewClient } from "./standings-preview-client";

export function StandingsPreview({ division, preview = false }: { division?: Division; preview?: boolean }) {
  const rows: Partial<Record<Division, readonly Standing[]>> = {};
  for (const slug of division ? [division] : divisionSlugs) {
    const standings = previewChampionship(slug, seriesData[slug].currentSeasonId);
    rows[slug] = preview ? standings.slice(0, 5) : standings;
  }
  return <StandingsPreviewClient division={division} preview={preview} rows={rows} />;
}
