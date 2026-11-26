import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { RaceDetails } from "@/components/calendar/race-details";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { getCalendarData } from "@/lib/calendar-data";
import { eventStandingsHref } from "@/lib/championship-data";
import { circuitHref, findCircuit } from "@/lib/public-information";
import { resultsHref } from "@/lib/race-results";
import { raceHref, type CalendarSearch } from "@/lib/race-schedule";
import "../schedule.css";

type Props = { params: Promise<{ locale: Locale; event: string }>; searchParams: Promise<CalendarSearch> };

async function getEvent({ params, searchParams }: Props) {
  const { locale, event } = await params;
  const data = getCalendarData(locale, (await searchParams).preview);
  const race = data.races.find(({ id }) => id === event);
  if (!race) notFound();
  return { locale, race, now: data.now, preview: data.preview, season: data.seasons.find(({ id }) => id === race.seasonId)?.label };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { race, locale, preview } = await getEvent(props);
  return { title: race.title, alternates: pageAlternates(locale, raceHref(race.id)), robots: preview ? { index: false } : undefined };
}

export default async function RaceEventPage(props: Props) {
  const { locale, race, preview, season, now } = await getEvent(props);
  setRequestLocale(locale);
  const standingsHref = preview ? undefined : eventStandingsHref(race.division, race.seasonId, race.id);
  const courseHref = race.courseId && findCircuit(race.courseId) ? circuitHref(race.courseId) : undefined;
  return <div className="competition-calendar"><RaceDetails race={race} season={season} preview={preview} now={now}
    resultsHref={preview ? undefined : resultsHref(race)} standingsHref={standingsHref} courseHref={courseHref} /></div>;
}
