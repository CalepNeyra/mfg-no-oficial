"use client";

import { useSearchParams } from "next/navigation";
import { calendarQuery, type CalendarKey } from "@/lib/race-schedule";
import { useSportTimeZone } from "../sport-time";

export function useCalendarQuery() {
  const search = useSearchParams();
  const query = calendarQuery(search);
  const zone = useSportTimeZone();

  function update(key: CalendarKey, value: string | null) {
    const url = new URL(window.location.href);
    url.searchParams.delete("tz");
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  }

  return { query, update, zone };
}
