import { documentKinds, isPublished, type Category, type EntrySeason } from "./catalog";

export function regulationHref(category: Category) {
  return `/regulations/${category}` as const;
}

export function publicationKey(category: Category, season?: EntrySeason) {
  if (!season?.regulationVersion?.trim() || !documentKinds.every((kind) => isPublished(season.documents[kind]))) return;
  return JSON.stringify([category, season.id, season.regulationVersion,
    ...documentKinds.map((kind) => [kind, season.documents[kind]?.id, season.documents[kind]?.revision])]);
}

export type RegulationReceipt = {
  category: Category;
  seasonId: string;
  version: string;
  publicationKey: string;
  acceptedAt: string;
  privacyAccepted: true;
};

export function receiptMatches(receipt: RegulationReceipt | null, category: Category, season?: EntrySeason) {
  const key = publicationKey(category, season);
  return Boolean(key && receipt?.publicationKey === key);
}
