"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import "./race-countdown.css";

const units = ["days", "hours", "minutes", "seconds"] as const;

function subscribe(notify: () => void) {
  const timer = window.setInterval(notify, 1000);
  return () => window.clearInterval(timer);
}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function serverSnapshot() {
  return null;
}

export function RaceCountdown({ date }: { date: string }) {
  const t = useTranslations("front.countdown");
  const format = useFormatter();
  const now = useSyncExternalStore(subscribe, nowInSeconds, serverSnapshot);
  const start = Date.parse(date) / 1000;
  if (now === null || !Number.isFinite(start) || now >= start) return null;

  const remaining = Math.ceil(start - now);
  const values = [
    Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60, remaining % 60,
  ];

  return (
    <dl className="race-countdown" aria-label={t("label")} aria-live="off">
      {units.map((unit, index) => (
        <div key={unit}>
          <dt>{t(unit)}</dt>
          <dd>{format.number(values[index], { minimumIntegerDigits: 2, useGrouping: false })}</dd>
        </div>
      ))}
    </dl>
  );
}
