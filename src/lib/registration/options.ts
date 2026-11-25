import countries from "i18n-iso-countries";
import type { MFGOption } from "@/components/mfg-select";

const regionCodes = Object.keys(countries.getAlpha2Codes());
const names = ["es", "en", "ja"].map((language) => new Intl.DisplayNames(language, { type: "region" }));

export function regionOptions(locale: string): MFGOption[] {
  const display = new Intl.DisplayNames(locale, { type: "region" });
  return regionCodes.map((code) => {
    const label = display.of(code) ?? code;
    return { value: label, label, keywords: [code, ...names.map((dictionary) => dictionary.of(code) ?? code)] };
  }).sort((first, second) => first.label.localeCompare(second.label, locale));
}

export const manufacturers: readonly MFGOption[] = [
  "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "BMW", "Bugatti", "Chevrolet", "Citroën",
  "Daihatsu", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "Honda", "Hyundai", "Isuzu",
  "Jaguar", "Kia", "Lamborghini", "Lancia", "Lexus", "Lotus", "Maserati", "Mazda", "McLaren",
  "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Pagani", "Peugeot", "Porsche",
  "Renault", "SEAT", "Škoda", "Subaru", "Suzuki", "Toyota", "Volkswagen", "Volvo",
].map((label) => ({ value: label, label }));

export const technicalOptions = {
  aspiration: ["natural", "turbo", "supercharged", "combined"],
  transmission: ["manual", "automatic", "sequential", "dualClutch", "cvt"],
  drivetrain: ["front", "rear", "allWheel", "fourWheel"],
} as const;
