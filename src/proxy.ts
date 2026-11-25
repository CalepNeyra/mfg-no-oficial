import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const localize = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const browserLanguages = request.headers.get("accept-language");
  if (!browserLanguages) return localize(request);

  // Match regional variants to our base languages without changing their quality weights.
  const normalized = browserLanguages.split(",")
    .filter((language) => !/^\s*\*\s*(?:;|$)/.test(language))
    .map((language) => language.replace(/^(\s*(?:ja|en|es))(?:-[a-z0-9]{1,8})+(?=\s*(?:;|$))/i, "$1"))
    .join(",");
  if (normalized === browserLanguages) return localize(request);

  const headers = new Headers(request.headers);
  headers.set("accept-language", normalized);
  return localize(new NextRequest(request, { headers }));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
