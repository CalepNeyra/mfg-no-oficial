import type { PortalImage } from "@/components/portal-ui";
import type { divisions } from "./portal";
import type { Race, RaceSeason } from "./race-schedule";

export type Division = keyof typeof divisions;
export type NewsItem = {
  division?: Division;
  title: string;
  category: string;
  description: string;
  date: string;
  dateLabel: string;
  href: string;
  image?: PortalImage;
};

export type Standing = {
  position: number;
  number: string;
  driver: string;
  portrait?: PortalImage;
  nationality: string;
  car: string;
  points: number;
};

export type MediaItem = {
  kind: "races" | "cars" | "drivers" | "qualifying" | "events";
  title: string;
  image?: PortalImage;
  video?: string;
};

export type Partner = { name: string; image: PortalImage; href?: string };

// Add confirmed records only. href values for portal content are locale-neutral paths.
export const races: readonly Race[] = [];
export const calendarSeasons: readonly RaceSeason[] = [];
export const news: readonly NewsItem[] = [];
export const gallery: readonly MediaItem[] = [];
export const partners: readonly Partner[] = [];
