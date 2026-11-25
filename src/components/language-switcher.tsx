"use client";

import { Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const languages = { ja: "JP", en: "EN", es: "ES" } satisfies Record<Locale, string>;

export function LanguageSwitcher({ className = "languages", onChange }: {
  className?: string;
  onChange?: () => void;
}) {
  const t = useTranslations("nav");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function changeLanguage(locale: Locale) {
    if (locale === current) return;
    onChange?.();
    const { search, hash } = window.location;
    router.replace(`${pathname}${search}${hash}`, { locale, scroll: false });
  }

  return (
    <div className={className} role="group" aria-label={t("language")}>
      <Globe2 size={14} aria-hidden="true" />
      {routing.locales.map((locale) => (
        <button key={locale} type="button" aria-label={t(locale)}
          aria-pressed={current === locale} onClick={() => changeLanguage(locale)}>
          {languages[locale]}
        </button>
      ))}
    </div>
  );
}
