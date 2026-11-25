import "server-only";

import { calendarSeasons, races } from "./competition";
import { previewCalendar } from "./calendar-preview";

export function getCalendarData(locale: string, previewValue?: string | string[] | null) {
  const now = Date.now();
  const preview = process.env.NODE_ENV === "development" && previewValue === "1";
  return { now, preview, ...(preview ? previewCalendar(now, locale) : { races: publishedRaces(), seasons: calendarSeasons }) };
}

function publishedRaces() {
  return races.map((race) => {
    if (!race.resources) return race;
    const resources = { ...race.resources };
    delete resources.entries;
    return { ...race, resources };
  });
}
