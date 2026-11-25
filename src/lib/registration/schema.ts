import { z } from "zod";
import { isCategory, type EntryCatalog, type EntrySeason } from "./catalog";

const requiredText = z.string().trim().min(1, "required").max(160, "length");
const optionalText = z.string().trim().max(160, "length");
const notes = z.string().trim().max(3000, "length");
const positive = z.string().trim().min(1, "required")
  .refine((value) => /^\d+(?:[.,]\d+)?$/.test(value) && Number.isFinite(Number(value.replace(",", "."))) && Number(value.replace(",", ".")) > 0, "positive");
const integer = z.string().trim().min(1, "required")
  .refine((value) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0, "integer");
const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const licenseTypes = [...photoTypes, "application/pdf"];

function attachments(types: string[], maximum?: number) {
  const file = z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "fileType")
    .refine((value) => types.includes(value.type), "fileType")
    .refine((value) => value.size > 0 && value.size <= 10 * 1024 * 1024, "fileSize");
  const list = z.array(file);
  return maximum === undefined ? list : list.max(maximum, "fileCount");
}

const categoryFields = { category: z.string(), seasonId: z.string() };
export function categorySchema(catalog: EntryCatalog) {
  return z.object(categoryFields).superRefine(({ category, seasonId }, ctx) => {
    if (!isCategory(category)) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "category" });
    } else if (!catalog[category].some((season) => season.id === seasonId)) {
      ctx.addIssue({ code: "custom", path: ["seasonId"], message: "season" });
    }
  });
}

export const driverSchema = z.object({
  firstName: requiredText,
  lastName: requiredText,
  birthDate: z.string().min(1, "required").pipe(z.iso.date({ error: "birthDate" }))
    .refine((value) => value <= new Date().toISOString().slice(0, 10), "birthDate"),
  nationality: requiredText,
  residence: requiredText,
  email: z.string().trim().min(1, "required").pipe(z.email({ error: "email" })),
  phoneCode: z.string().trim().min(1, "required").regex(/^\+[1-9]\d{0,2}$/, "phoneCode"),
  phone: z.string().trim().min(1, "required")
    .refine((value) => /^[0-9 ()-]+$/.test(value) && /\d/.test(value) && value.length <= 30, "phone"),
  driverPhoto: attachments(photoTypes, 1),
  driverLicense: attachments(licenseTypes, 1),
  experience: notes,
  previousMfg: notes,
  team: optionalText,
});

export const vehicleSchema = z.object({
  make: requiredText,
  model: requiredText,
  version: optionalText,
  year: z.string().trim().min(1, "required").regex(/^[1-9]\d{3}$/, "year"),
  chassis: optionalText,
  engine: optionalText,
  displacement: integer,
  aspiration: requiredText,
  power: positive,
  weight: positive,
  transmission: requiredText,
  gears: integer,
  drivetrain: requiredText,
  modifications: notes,
  vehiclePhotos: attachments(photoTypes),
});

const numberField = z.string().trim().min(1, "required").regex(/^\d+$/, "digits");
export function numberSchema(season?: EntrySeason) {
  const limit = season?.numbering?.maxDigits;
  return z.object({
    raceNumber: limit ? numberField.max(limit, "numberLength") : numberField,
  });
}

export const registrationDraftSchema = z.object({
  ...categoryFields, ...driverSchema.shape, ...vehicleSchema.shape,
  raceNumber: numberField,
});

export type RegistrationDraft = z.input<typeof registrationDraftSchema>;

export const emptyDraft: RegistrationDraft = {
  category: "", seasonId: "",
  firstName: "", lastName: "", birthDate: "", nationality: "", residence: "", email: "", phoneCode: "", phone: "",
  driverPhoto: [], driverLicense: [], experience: "", previousMfg: "", team: "",
  make: "", model: "", version: "", year: "", chassis: "", engine: "", displacement: "", aspiration: "",
  power: "", weight: "", transmission: "", gears: "", drivetrain: "", modifications: "", vehiclePhotos: [],
  raceNumber: "",
};
