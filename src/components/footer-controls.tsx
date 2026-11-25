"use client";

import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

function readYear() {
  return new Date().getFullYear();
}

function subscribeToYear(notify: () => void) {
  const timer = window.setInterval(notify, 60 * 60 * 1000);
  return () => window.clearInterval(timer);
}

export function FooterYear({ initialYear }: { initialYear: number }) {
  const t = useTranslations("footer");
  const year = useSyncExternalStore(subscribeToYear, readYear, () => initialYear);
  return <p className="footer-year">{t("year", { year: String(year) })}</p>;
}

export function BackToTop() {
  const t = useTranslations("footer");

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("site-top")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  }

  return (
    <button type="button" className="footer-to-top" onClick={scrollToTop}>
      <ArrowUp size={17} aria-hidden="true" />{t("backToTop")}
    </button>
  );
}
