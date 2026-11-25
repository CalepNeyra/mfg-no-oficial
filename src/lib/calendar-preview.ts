import { dayKey, dayStamp, japanTime, type Race, type RaceSeason } from "./race-schedule";

const season: RaceSeason = { id: "preview", label: "QA" };

export function previewCalendar(now: number, locale: string) {
  const labels = locale === "ja" ? ["テストイベント A", "テストイベント B", "日程未定のテストイベント", "テスト会場", "テストコース"] :
    locale === "en" ? ["Test event A", "Test event B", "Unscheduled test event", "Test venue", "Test course"] :
    ["Evento de prueba A", "Evento de prueba B", "Evento de prueba sin fecha", "Sede de prueba", "Recorrido de prueba"];
  const jstMidnight = dayStamp(dayKey(now, japanTime)) - 9 * 3600000;
  const iso = (offset: number) => new Date(jstMidnight + offset * 3600000).toISOString();

  const races: Race[] = [{
    id: "qa-event-a",
    seasonId: season.id,
    round: 1,
    title: labels[0],
    division: "super-series",
    location: labels[3],
    state: "scheduled",
    schedule: { startAt: iso(25), endAt: iso(40), confirmed: true },
    sessions: [
      { id: "qa-q", kind: "qualifying", startAt: iso(27) },
      { id: "qa-r", kind: "race", startAt: iso(38), endAt: iso(40) },
    ],
    image: { src: "/images/home/about.webp", alt: "" },
    course: { name: labels[4] },
  }, {
    id: "qa-event-b",
    seasonId: season.id,
    round: 2,
    title: labels[1],
    division: "freshman-series",
    state: "finished",
    schedule: { startAt: iso(-58), endAt: iso(-51), confirmed: true },
  }, {
    id: "qa-event-pending",
    seasonId: season.id,
    round: 3,
    title: labels[2],
    division: "freshman-series",
    state: "pending",
  }];

  return { races, seasons: [season] };
}
