import { getPathname } from "./navigation";
import { routing, type Locale } from "./routing";

export function pageAlternates(locale: Locale, href: string) {
  return {
    canonical: getPathname({ locale, href }),
    languages: {
      ...Object.fromEntries(routing.locales.map((language) => [language, getPathname({ locale: language, href })])),
      "x-default": getPathname({ locale: routing.defaultLocale, href }),
    },
  };
}
