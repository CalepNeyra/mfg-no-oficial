"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useController, useFormContext, type FieldPathByValue } from "react-hook-form";
import { MFGCombobox } from "@/components/mfg-combobox";
import { MFGSelect, type MFGOption } from "@/components/mfg-select";
import { manufacturers, regionOptions, technicalOptions } from "@/lib/registration/options";
import type { RegistrationDraft } from "@/lib/registration/schema";

type TextName = FieldPathByValue<RegistrationDraft, string>;
type AttachmentName = FieldPathByValue<RegistrationDraft, File[]>;
type OptionSource = "regions" | "manufacturers" | keyof typeof technicalOptions;

type TextSpec = {
  name: TextName;
  required?: boolean;
  multiline?: boolean;
  options?: OptionSource;
  attributes?: Pick<ComponentPropsWithoutRef<"input">, "type" | "inputMode" | "autoComplete" | "maxLength">;
};

export const driverFields: readonly TextSpec[] = [
  { name: "firstName", required: true, attributes: { autoComplete: "off" } },
  { name: "lastName", required: true, attributes: { autoComplete: "off" } },
  { name: "birthDate", required: true, attributes: { type: "date" } },
  { name: "nationality", required: true, options: "regions" },
  { name: "residence", required: true, options: "regions" },
  { name: "email", required: true, attributes: { type: "email" } },
  { name: "phoneCode", required: true, attributes: { type: "tel", maxLength: 4 } },
  { name: "phone", required: true, attributes: { type: "tel" } },
  { name: "team" },
  { name: "experience", multiline: true },
  { name: "previousMfg", multiline: true },
];

export const vehicleFields: readonly TextSpec[] = [
  { name: "make", required: true, options: "manufacturers" }, { name: "model", required: true }, { name: "version" },
  { name: "year", required: true, attributes: { inputMode: "numeric", maxLength: 4 } },
  { name: "chassis" }, { name: "engine" },
  { name: "displacement", required: true, attributes: { inputMode: "numeric" } },
  { name: "aspiration", required: true, options: "aspiration" },
  { name: "power", required: true, attributes: { inputMode: "decimal" } },
  { name: "weight", required: true, attributes: { inputMode: "decimal" } },
  { name: "transmission", required: true, options: "transmission" },
  { name: "gears", required: true, attributes: { inputMode: "numeric" } },
  { name: "drivetrain", required: true, options: "drivetrain" },
  { name: "modifications", multiline: true },
];

export const attachmentFields = ["driverPhoto", "driverLicense", "vehiclePhotos"] as const;

function Field({ name, required, wide = false, error, hint, children }: {
  name: keyof RegistrationDraft; required?: boolean; wide?: boolean; error?: string; hint?: string; children: ReactNode;
}) {
  const t = useTranslations("entry");

  return (
    <div className={wide ? "entry-field entry-wide" : "entry-field"}>
      <label htmlFor={`entry-${name}`}>
        {t(`fields.${name}`)}
        <span className="entry-field-marker">{t(required ? "required" : "optional")}</span>
      </label>
      {hint && <p className="entry-hint" id={`entry-${name}-hint`}>{hint}</p>}
      {children}
      {error && <p className="entry-error" role="alert" id={`entry-${name}-error`}>{t(`validation.${error}`)}</p>}
    </div>
  );
}

function controlProps(name: string, error?: string, hint?: string) {
  const describedBy = [hint && `entry-${name}-hint`, error && `entry-${name}-error`].filter(Boolean).join(" ");
  return { id: `entry-${name}`, "aria-invalid": Boolean(error) || undefined, "aria-describedby": describedBy || undefined };
}

export function EntryTextField({ name, required, multiline, attributes, prefix, hint }: TextSpec & { prefix?: string; hint?: string }) {
  const { clearErrors } = useFormContext<RegistrationDraft>();
  const { field, fieldState } = useController<RegistrationDraft, TextName>({ name });
  const error = fieldState.error?.message;
  const props = {
    ...field, ...controlProps(name, error, hint), required,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      field.onChange(event);
      clearErrors(name);
    },
  };

  return (
    <Field name={name} required={required} wide={multiline} error={error} hint={hint}>
      {multiline ? <textarea {...props} rows={4} maxLength={3000} /> : (
        prefix ? (
          <div className="entry-prefix"><span aria-hidden="true">{prefix}</span>
            <input {...props} {...attributes} />
          </div>
        ) : <input {...props} {...attributes} />
      )}
    </Field>
  );
}

export function EntrySelect({ name, options, onValue, disabled, required = true, allowCustom }: {
  name: TextName; options: readonly MFGOption[]; onValue: (value: string) => void;
  disabled?: boolean; required?: boolean; allowCustom?: boolean;
}) {
  const t = useTranslations("entry");
  const { clearErrors } = useFormContext<RegistrationDraft>();
  const { field: { ref, value, onBlur, onChange }, fieldState } = useController<RegistrationDraft, TextName>({ name });
  const error = fieldState.error?.message;
  const dropdownProps = {
    ...controlProps(name, error), ref, value, onBlur, options, placeholder: t("select"), required, disabled,
    onValueChange(next: string) {
      if (next === value) return;
      onChange(next);
      clearErrors(name);
      onValue(next);
    },
  };

  return (
    <Field name={name} required={required} error={error}>
      {allowCustom || options.length > 12 ? (
        <MFGCombobox {...dropdownProps} allowCustom={allowCustom} />
      ) : <MFGSelect {...dropdownProps} />}
    </Field>
  );
}

export function EntryRegistrationField({ options, onEdit, ...field }: TextSpec & { onEdit: () => void }) {
  const locale = useLocale();
  const t = useTranslations("select.technical");
  if (!options) return <EntryTextField {...field} />;

  const choices = options === "regions" ? regionOptions(locale) : options === "manufacturers" ? manufacturers :
    technicalOptions[options].map((key) => {
      const label = t(`${options}.${key}`);
      return { value: label, label };
    });
  return <EntrySelect name={field.name} required={field.required} options={choices} allowCustom onValue={onEdit} />;
}

export function EntryFiles({ name }: { name: AttachmentName }) {
  const t = useTranslations("entry");
  const { clearErrors } = useFormContext<RegistrationDraft>();
  const { field: { ref: inputRef, onBlur, onChange, value: selectedFiles }, fieldState } = useController<RegistrationDraft, AttachmentName>({ name });
  const error = fieldState.error?.message;
  const hint = t(name === "driverLicense" ? "licenseHint" : "photoHint");
  return (
    <Field name={name} wide error={error} hint={hint}>
      <input type="file" {...controlProps(name, error, hint)} ref={inputRef} onBlur={onBlur}
        accept={name === "driverLicense" ? "image/jpeg,image/png,image/webp,application/pdf" : "image/jpeg,image/png,image/webp"}
        multiple={name === "vehiclePhotos"} onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (!files.length) return;
          onChange(files);
          clearErrors(name);
          event.currentTarget.value = "";
        }} />
      {selectedFiles.length > 0 && (
        <div className="entry-file-selection">
          <ul>{selectedFiles.map((file, index) => <li key={index}>{file.name}</li>)}</ul>
          <button type="button" className="action" onClick={() => { onChange([]); clearErrors(name); }}>
            {t("removeFiles")}
          </button>
        </div>
      )}
    </Field>
  );
}
