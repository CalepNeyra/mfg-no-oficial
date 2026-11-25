"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { isCategory, type Category, type EntryCatalog, type EntrySeason } from "@/lib/registration/catalog";
import { publicationKey, receiptMatches, type RegulationReceipt } from "@/lib/registration/regulations";
import { emptyDraft, type RegistrationDraft } from "@/lib/registration/schema";

type DraftContext = {
  catalog: EntryCatalog;
  intent: { category: Category; seasonId: string } | null;
  beginReview: (category: Category, seasonId: string) => void;
  cancelReview: () => void;
  recordAcceptance: (category: Category, season: EntrySeason, expectedKey: string) => boolean;
  clearAcceptance: () => void;
  receipt: RegulationReceipt | null;
  completed: number[];
  setCompleted: Dispatch<SetStateAction<number[]>>;
};

const RegistrationContext = createContext<DraftContext | null>(null);

export function RegistrationDraftProvider({ catalog, children }: { catalog: EntryCatalog; children: ReactNode }) {
  const methods = useForm<RegistrationDraft>({ defaultValues: emptyDraft, shouldUnregister: false });
  const [category, seasonId] = useWatch({ control: methods.control, name: ["category", "seasonId"] });
  const [intent, setIntent] = useState<DraftContext["intent"]>(null);
  const [savedReceipt, setReceipt] = useState<RegulationReceipt | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const season = isCategory(category) ? catalog[category].find(({ id }) => id === seasonId) : undefined;
  const receipt = isCategory(category) && receiptMatches(savedReceipt, category, season) ? savedReceipt : null;

  function clearAcceptance() {
    setReceipt(null);
    setIntent(null);
  }

  function recordAcceptance(target: Category, selected: EntrySeason, expectedKey: string) {
    const current = methods.getValues();
    const published = catalog[target].find(({ id }) => id === selected.id);
    const key = publicationKey(target, published);
    if (!intent || intent.category !== target || intent.seasonId !== selected.id ||
        current.category !== target || current.seasonId !== selected.id ||
        !published?.regulationVersion || !key || key !== expectedKey) return false;
    setReceipt({ category: target, seasonId: selected.id, version: published.regulationVersion,
      publicationKey: key, acceptedAt: new Date().toISOString(), privacyAccepted: true });
    setIntent(null);
    return true;
  }

  return (
    <RegistrationContext.Provider value={{
      catalog, intent, beginReview: (category, seasonId) => setIntent({ category, seasonId }),
      cancelReview: () => setIntent(null), recordAcceptance, clearAcceptance, receipt, completed, setCompleted,
    }}>
      <FormProvider {...methods}>{children}</FormProvider>
    </RegistrationContext.Provider>
  );
}

export function useRegistrationDraft() {
  const draft = useContext(RegistrationContext);
  if (!draft) throw new Error("RegistrationDraftProvider is required");
  return draft;
}
