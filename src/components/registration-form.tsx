"use client";

import { Check, CircleCheck, ClipboardCheck, LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Link } from "@/i18n/navigation";
import { categories, getNumberAvailabilityQuery, isCategory, numberPrefix } from "@/lib/registration/catalog";
import { publicationKey, regulationHref } from "@/lib/registration/regulations";
import { categorySchema, driverSchema, numberSchema, vehicleSchema,
  type RegistrationDraft } from "@/lib/registration/schema";
import { EmptyState } from "./portal-ui";
import { driverFields, EntryFiles, EntryRegistrationField, EntrySelect, EntryTextField, vehicleFields } from "./registration/fields";
import { RegistrationReview } from "./registration/review";
import { useRegistrationDraft } from "./registration/draft-provider";

const steps = ["category", "driver", "vehicle", "number", "review"] as const;

export function RegistrationForm() {
  const t = useTranslations();
  const { control, clearErrors, getValues, setError, setFocus, setValue } = useFormContext<RegistrationDraft>();
  const { catalog, receipt, clearAcceptance, beginReview, completed, setCompleted } = useRegistrationDraft();
  const [category, seasonId, raceNumber] = useWatch({ control, name: ["category", "seasonId", "raceNumber"] });
  const [currentStep, setStep] = useState(0);
  const step = receipt ? currentStep : 0;
  const heading = useRef<HTMLHeadingElement>(null);
  const navigating = useRef(false);
  const seasons = isCategory(category) ? catalog[category] : [];
  const season = seasons.find(({ id }) => id === seasonId);
  const publicationReady = isCategory(category) && Boolean(publicationKey(category, season));
  const noSeasons = categories.every((value) => !catalog[value].length);
  const requiresPublishedSeason = noSeasons || (Boolean(category) && !seasons.length);
  const number = getNumberAvailabilityQuery(category, season, raceNumber);
  const prefix = numberPrefix(category, season);

  useEffect(() => {
    if (navigating.current) heading.current?.focus();
  }, [step]);

  function goTo(target: number) {
    navigating.current = true;
    setStep(target);
  }

  function invalidate(index: number) {
    setCompleted((current) => current.includes(index) ? current.filter((item) => item !== index) : current);
  }

  function resetConditions() {
    clearAcceptance();
    clearErrors("raceNumber");
    setCompleted((current) => current.filter((item) => item !== 0 && item !== 3));
  }

  function advance(event: FormEvent) {
    event.preventDefault();
    if (step === 4 || !receipt) return;

    const schema = [categorySchema(catalog), driverSchema, vehicleSchema, numberSchema(season)][step];
    const result = schema.safeParse(getValues());
    if (!result.success) {
    const invalid = new Set<keyof RegistrationDraft>();
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RegistrationDraft;
      if (invalid.has(field)) continue;
      invalid.add(field);
      setError(field, { type: "validation", message: issue.message });
    }
    const first = invalid.values().next().value;
    if (first) setFocus(first);
    invalidate(step);
    return;
    }

    setCompleted((current) => current.includes(step) ? current : [...current, step]);
    goTo(step + 1);
  }

  return (
    <div className="registration-workflow">
      <section className="portal-panel entry-panel" aria-labelledby="registration-wizard">
        <h2 id="registration-wizard">{t("entry.application")}</h2>
        <p>{t("entry.localDraft")}</p>

        <ol className="entry-steps" aria-label={t("entry.progress")}>
          {steps.map((name, index) => {
            const done = Boolean(receipt) && completed.includes(index) && steps.slice(0, index).every((_, item) => completed.includes(item));
            const reachable = index <= step || (Boolean(receipt) && steps.slice(0, index).every((_, item) => completed.includes(item)));
            return (
              <li key={name}>
                <button type="button" aria-current={index === step ? "step" : undefined}
                  disabled={!reachable} onClick={() => goTo(index)}>
                  <span className="entry-step-number">{index + 1}</span>
                  <span>{t(`entry.steps.${name}`)}</span>
                  {done && <><Check size={15} aria-hidden="true" /><span className="sr-only">{t("entry.completed")}</span></>}
                </button>
              </li>
            );
          })}
        </ol>

        <form onSubmit={advance} onChange={() => invalidate(step)} autoComplete="off" noValidate>
          <h3 ref={heading} className="entry-stage-title" tabIndex={-1}>
            {t("entry.stepCount", { step: step + 1, total: steps.length })} · {t(`entry.steps.${steps[step]}`)}
          </h3>

          {step === 0 && (
            <>
              <div className="entry-fields">
                <EntrySelect name="category" options={categories.map((value) => ({
                  value, label: `MFG ${t(`divisions.${value}.title`)}`, description: t(`divisions.${value}.level`),
                }))}
                  onValue={() => {
                    setValue("seasonId", "");
                    clearErrors("seasonId");
                    resetConditions();
                  }} />
                <EntrySelect name="seasonId" disabled={!seasons.length}
                  options={seasons.map(({ id, label }) => ({ value: id, label }))}
                  onValue={resetConditions} />
              </div>
              {isCategory(category) && (
                <div className="entry-category-info" aria-live="polite">
                  <h4>{t(`divisions.${category}.title`)}</h4>
                  <p>{t(`divisions.${category}.description`)}</p>
                  <p><strong>{t("entry.opening")}</strong> · {t(`entry.openingStatus.${season?.status ?? "pending"}`)}</p>
                  {requiresPublishedSeason && <p className="entry-notice">{t("entry.noSeasons")}</p>}
                  <h4>{t("entry.requirementsTitle")}</h4>
                  {season?.requirements.length ? (
                    <ul>{season.requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>
                  ) : <p>{t("entry.requirementsBody")}</p>}
                  <Link className="text-link" href={`${regulationHref(category)}?from=registration`}
                    onNavigate={() => beginReview(category, seasonId)}>{t("entry.regulationsLink")}</Link>
                  {receipt ? (
                    <p className="entry-regulation-accepted" role="status">
                      <CircleCheck size={18} aria-hidden="true" /> {t("regulation.accepted")}
                    </p>
                  ) : <p className="entry-hint">{t(publicationReady ? "regulation.acceptanceRequired" : "regulation.unpublished")}</p>}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <div className="entry-fields">
              {driverFields.map((field) => <EntryRegistrationField key={field.name} {...field} onEdit={() => invalidate(step)} />)}
              <EntryFiles name="driverPhoto" />
              <EntryFiles name="driverLicense" />
            </div>
          )}

          {step === 2 && (
            <div className="entry-fields">
              {vehicleFields.map((field) => <EntryRegistrationField key={field.name} {...field} onEdit={() => invalidate(step)} />)}
              <EntryFiles name="vehiclePhotos" />
            </div>
          )}

          {step === 3 && (
            <div className="entry-terms">
              <section className="entry-document">
                <h4>{t("entry.numberRulesTitle")}</h4>
                <p>{season?.numbering?.description || t("entry.numberRulesPending")}</p>
              </section>
              <div className="entry-fields">
                <EntryTextField name="raceNumber" required attributes={{ inputMode: "numeric" }}
                  prefix={prefix} hint={prefix ? t("entry.prefix", { prefix }) : undefined} />
              </div>
              <div className="entry-notice" aria-live="polite">
                {number && <p>{t("entry.numberPreview", { number: number.number, season: season?.label ?? "" })}</p>}
                <p>{t("entry.availabilityPending")}</p>
              </div>
            </div>
          )}

          {step === 4 && <RegistrationReview draft={getValues()} season={season} receipt={receipt} edit={goTo} />}

          <div className="form-actions">
            {step > 0 && <button className="action" type="button" onClick={() => goTo(step - 1)}>{t("entry.back")}</button>}
            {step < 4 ? (
              <button className="action action-primary" type="submit" disabled={!receipt}>
                {t("entry.next")}
              </button>
            ) : (
              <button className="action action-primary" type="button" disabled aria-describedby="entry-submit-note">
                {t("entry.send")}
              </button>
            )}
          </div>
          {step === 4 && <p className="entry-hint" id="entry-submit-note">{t("entry.submissionLocked")}</p>}
        </form>
      </section>

      <section className="portal-panel" id="status" aria-labelledby="registration-status">
        <h2 id="registration-status">{t("entry.statusTitle")}</h2>
        <div><EmptyState icon={step === 4 ? ClipboardCheck : LockKeyhole}>
          {t(step === 4 ? "entry.draftReviewed" : "entry.statusPending")}
        </EmptyState></div>
      </section>
    </div>
  );
}
