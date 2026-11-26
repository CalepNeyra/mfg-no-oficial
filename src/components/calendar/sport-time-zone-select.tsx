"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseInstant } from "@/lib/race-schedule";
import { isSupportedTimeZone, localTime, timeZoneRegions, utcOffsetAt } from "@/lib/sport-time-zones";
import { MFGCombobox } from "../mfg-combobox";
import type { MFGOption } from "../mfg-select";
import { setSportTimePreference, useSportTimePreference } from "../sport-time";

const englishCountries = new Intl.DisplayNames("en", { type: "region" });

export function SportTimeZoneSelect({ now, eventStart }: { now: number; eventStart?: string }) {
  const locale = useLocale();
  const t = useTranslations("schedule");
  const { preference, browserZone } = useSportTimePreference();
  const event = eventStart ? parseInstant(eventStart) : NaN;
  const hasEvent = Number.isFinite(event);
  const reference = hasEvent ? event : now;
  const countries = new Intl.DisplayNames(locale, { type: "region" });
  const offsetAt = (id: string) => utcOffsetAt(id, reference);
  const options: MFGOption[] = [{
    value: localTime,
    label: t("zones.local"),
    description: [browserZone, offsetAt(browserZone)].filter(Boolean).join(" · "),
    keywords: [browserZone.replace(/[_/]/g, " ")],
  }];

  const regions = Object.keys(timeZoneRegions) as (keyof typeof timeZoneRegions)[];
  for (const region of regions) {
    const group = t(`zones.regions.${region}`);
    for (const entry of timeZoneRegions[region]) {
      const { id, country, city } = entry;
      if (!isSupportedTimeZone(id)) continue;
      const type = "type" in entry ? t(`zones.types.${entry.type}`) : "";
      const offset = offsetAt(id);
      const countryName = countries.of(country) ?? country;
      options.push({
        value: id,
        label: `${countryName} — ${t(`zones.cities.${city}`)}`,
        description: [type, offset].filter(Boolean).join(" · "),
        keywords: [country, englishCountries.of(country) ?? "", group, id, id.replace(/[_/]/g, " ")],
        group,
      });
    }
  }

  return (
    <div className="calendar-select">
      <label htmlFor="schedule-zone">{t("timeZone")}</label>
      <MFGCombobox id="schedule-zone" value={preference} onValueChange={setSportTimePreference}
        placeholder={t("timeZone")} options={options} searchLabel={t("zones.search")}
        menuClassName="mfg-time-zone-menu" menuNote={t(hasEvent ? "zones.offsetAtEvent" : "zones.offsetToday")} />
    </div>
  );
}
