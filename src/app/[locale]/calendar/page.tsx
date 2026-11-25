import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompetitionCalendar } from "@/components/calendar/calendar-page";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { getCalendarData } from "@/lib/calendar-data";
import type { CalendarSearch } from "@/lib/race-schedule";
import "./schedule.css";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<CalendarSearch> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schedule" });
  return { title: t("title"), description: t("intro"), alternates: pageAlternates(locale, "/calendar"),
    robots: (await searchParams).preview === "1" ? { index: false } : undefined };
}

export default async function CalendarPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schedule");
  const data = getCalendarData(locale, (await searchParams).preview);
  return (
    <div className="competition-calendar">
      <div className="calendar-heading">
        <div className="shell calendar-heading-inner">
          <div><h1>{t("title")}</h1><p>{t("intro")}</p></div>
          <CalendarDays size={39} strokeWidth={1.3} aria-hidden="true" />
        </div>
      </div>
      <CompetitionCalendar records={data.races} seasons={data.seasons} now={data.now} preview={data.preview} />
    </div>
  );
}
