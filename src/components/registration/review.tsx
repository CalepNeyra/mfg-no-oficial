"use client";

import { useTranslations } from "next-intl";
import { documentKinds, getNumberAvailabilityQuery, type EntrySeason } from "@/lib/registration/catalog";
import type { RegistrationDraft } from "@/lib/registration/schema";
import { attachmentFields, driverFields, vehicleFields } from "./fields";
import type { RegulationReceipt } from "@/lib/registration/regulations";

export function RegistrationReview({ draft, season, receipt, edit }: {
  draft: RegistrationDraft; season?: EntrySeason; receipt: RegulationReceipt | null; edit: (step: number) => void;
}) {
  const t = useTranslations();
  const number = getNumberAvailabilityQuery(draft.category, season, draft.raceNumber)?.number;
  const groups = [
    {
      id: "category", step: 0, rows: [
        [t("entry.fields.category"), `MFG ${t(`divisions.${draft.category}.title`)}`],
        [t("entry.fields.seasonId"), season?.label],
      ],
    },
    { id: "driver", step: 1, rows: driverFields.map(({ name }) => [t(`entry.fields.${name}`), draft[name]]) },
    { id: "vehicle", step: 2, rows: vehicleFields.map(({ name }) => [t(`entry.fields.${name}`), draft[name]]) },
    { id: "number", step: 3, rows: [[t("entry.fields.raceNumber"), number]] },
    {
      id: "documents", rows: attachmentFields.map((name) => [
        t(`entry.fields.${name}`), draft[name].map((file) => file.name).join(", "),
      ]),
    },
    {
      id: "terms", step: 0, rows: [
        ...documentKinds.map((kind) => [
          t(`entry.documents.${kind}`), season?.documents[kind]?.revision,
        ]),
        [t("regulation.version"), receipt?.version],
        [t("entry.review.acceptRegulations"), receipt ? t("entry.accepted") : t("entry.notEntered")],
        [t("entry.review.acceptPrivacy"), receipt?.privacyAccepted ? t("entry.accepted") : t("entry.notEntered")],
      ],
    },
  ];

  return (
    <div className="entry-summary">
      {groups.map(({ id, step, rows }) => (
        <section key={id} className="entry-summary-section" aria-labelledby={`entry-review-${id}`}>
          <header>
            <h4 id={`entry-review-${id}`}>{t(`entry.review.${id}`)}</h4>
            {step !== undefined && (
              <button type="button" className="text-link" onClick={() => edit(step)}
                aria-label={t("entry.editSection", { section: t(`entry.review.${id}`) })}>{t("entry.edit")}</button>
            )}
          </header>
          <dl className="entry-summary-grid">
            {rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value?.trim() || t("entry.notEntered")}</dd></div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
