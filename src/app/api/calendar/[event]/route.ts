import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getCalendarData } from "@/lib/calendar-data";
import { createCalendarFile } from "@/lib/calendar-export";

export async function GET(request: Request, { params }: { params: Promise<{ event: string }> }) {
  const { event } = await params;
  const search = new URL(request.url).searchParams;
  const language = search.get("locale");
  const locale = hasLocale(routing.locales, language) ? language : routing.defaultLocale;
  const { races, now } = getCalendarData(locale, search.get("preview"));
  const race = races.find(({ id }) => id === event);
  const file = race && createCalendarFile(race, now);
  if (!file) return new Response(null, { status: 404 });

  return new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="mfg-${event.replace(/[^a-z\d-]/gi, "-")}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
