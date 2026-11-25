"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { calendarQuery, japanTime, type CalendarKey } from "@/lib/race-schedule";

function subscribe() {
  return () => {};
}

function browserZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || japanTime;
}

function defaultZone() {
  return japanTime;
}

export function useCalendarQuery() {
  const search = useSearchParams();
  const localZone = useSyncExternalStore(subscribe, browserZone, defaultZone);
  const query = calendarQuery(search);
  const zone = query.get("tz") === "local" ? localZone : japanTime;

  function update(key: CalendarKey, value: string | null) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  }

  return { query, update, zone };
}
