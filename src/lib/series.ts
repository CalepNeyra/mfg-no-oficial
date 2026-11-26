import type { PortalImage } from "@/components/portal-ui";
import type { Division } from "./competition";

export function seriesHref(division: Division, section: "calendar" | "standings" | "results" | "drivers" | "circuits" | "news") {
  return `/${section}?series=${division}`;
}

export type SeriesProfile = {
  name: string;
  detail?: string;
  image?: PortalImage;
  number?: string;
  nationality?: string;
  car?: string;
  manufacturer?: string;
  driver?: string;
  href?: string;
};
type SeriesData = {
  number: "01" | "02";
  images: Partial<Record<"overview" | "skill" | "grid" | "participation", PortalImage>>;
  editorialImage?: PortalImage;
  currentSeasonId?: string;
  rounds?: number;
  finalists?: number;
  powerLimitPs?: number;
  drivers: readonly SeriesProfile[];
  cars: readonly SeriesProfile[];
};

// Populate only after publication. Season references use existing catalog IDs.
export const seriesData: Record<Division, SeriesData> = {
  "super-series": { number: "01", images: {}, drivers: [], cars: [] },
  "freshman-series": { number: "02", images: {}, drivers: [], cars: [] },
};
