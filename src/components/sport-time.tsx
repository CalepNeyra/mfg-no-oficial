"use client";

import { useLocale } from "next-intl";
import { useSyncExternalStore } from "react";
import { parseInstant } from "@/lib/race-schedule";
import { isSupportedTimeZone, japanTime, localTime } from "@/lib/sport-time-zones";

const storageKey = "mfg.time-zone";
const changeEvent = "mfg:time-zone";
let memoryPreference: string | undefined;

function readPreference() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved === localTime || (saved && isSupportedTimeZone(saved)) ? saved : localTime;
  } catch {
    return memoryPreference ?? localTime;
  }
}

function readBrowserZone() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isSupportedTimeZone(zone) ? zone : japanTime;
}

function defaultZone() {
  return japanTime;
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) notify();
  };
  window.addEventListener(changeEvent, notify);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", notify);
  return () => {
    window.removeEventListener(changeEvent, notify);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", notify);
  };
}

export function setSportTimePreference(value: string) {
  if (value !== localTime && !isSupportedTimeZone(value)) return;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    memoryPreference = value;
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useSportTimePreference() {
  const preference = useSyncExternalStore(subscribe, readPreference, defaultZone);
  const browserZone = useSyncExternalStore(subscribe, readBrowserZone, defaultZone);
  return { preference, browserZone, zone: preference === localTime ? browserZone : preference };
}

export function useSportTimeZone() {
  return useSportTimePreference().zone;
}

export function SportTime({ instant, dateOnly = false }: { instant: string; dateOnly?: boolean }) {
  const zone = useSportTimeZone();
  const locale = useLocale();
  const at = parseInstant(instant);
  if (!Number.isFinite(at)) return null;

  const options: Intl.DateTimeFormatOptions = dateOnly ? { dateStyle: "long" } : {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  };
  const date = new Date(at);
  return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat(locale, { ...options, timeZone: zone }).format(date)}</time>;
}
