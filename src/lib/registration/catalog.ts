import type { Locale } from "@/i18n/routing";

export const categories = ["super-series", "freshman-series"] as const;
export type Category = (typeof categories)[number];

export const documentKinds = ["sporting", "technical", "terms", "privacy"] as const;
export type DocumentKind = (typeof documentKinds)[number];

export type EntryDocument = {
  id: string;
  revision: string;
  href?: string;
  // Complete, accessible text of the published document, in the page language.
  paragraphs?: readonly string[];
};

export type NumberingRules = {
  description: string;
  prefix?: "F";
  maxDigits?: number;
};

export type EntrySeason = {
  id: string;
  label: string;
  status: "open" | "closed" | "pending";
  requirements: readonly string[];
  regulationVersion?: string;
  generalProvisions?: readonly string[];
  sanctions?: readonly string[];
  documents: Partial<Record<DocumentKind, EntryDocument>>;
  numbering?: NumberingRules;
  publicDocuments?: Partial<Record<"conduct" | "notices", readonly { title: string; href: string }[]>>;
};

export type EntryCatalog = Record<Category, readonly EntrySeason[]>;

const unpublishedCatalog: EntryCatalog = {
  "super-series": [],
  "freshman-series": [],
};

export const entryCatalog: Record<Locale, EntryCatalog> = {
  ja: unpublishedCatalog,
  en: unpublishedCatalog,
  es: unpublishedCatalog,
};

export function isCategory(value: string): value is Category {
  return categories.some((category) => category === value);
}

export function isPublished(document?: EntryDocument): document is EntryDocument {
  return Boolean(document?.id && document.revision && (document.href || document.paragraphs?.length));
}

export function numberPrefix(category: string, season?: EntrySeason) {
  return category === "freshman-series" ? season?.numbering?.prefix ?? "" : "";
}

export type NumberAvailabilityQuery = {
  category: Category;
  seasonId: string;
  number: string;
};

export function getNumberAvailabilityQuery(category: string, season?: EntrySeason, rawNumber = "") {
  const digits = rawNumber.trim();
  if (!isCategory(category) || !season || !/^\d+$/.test(digits)) return;
  if (season.numbering?.maxDigits && digits.length > season.numbering.maxDigits) return;
  return { category, seasonId: season.id, number: numberPrefix(category, season) + digits } satisfies NumberAvailabilityQuery;
}
