import { confirmedSchedule, parseInstant, type Race } from "./race-schedule";

function timestamp(value: string | number) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function validEnd(start: string, end?: string) {
  return end && parseInstant(end) > parseInstant(start) ? end : undefined;
}

export function googleCalendarHref(race: Race) {
  const schedule = confirmedSchedule(race);
  if (!schedule) return;

  const start = timestamp(schedule.startAt);
  const end = validEnd(schedule.startAt, schedule.endAt);
  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: race.title,
    dates: start + "/" + (end ? timestamp(end) : start),
  });
  if (race.location) query.set("location", race.location);

  return "https://calendar.google.com/calendar/render?" + query.toString();
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|[\r\n]/g, "\\n")
    .replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function fold(line: string) {
  const encoder = new TextEncoder();
  let output = "";
  let bytes = 0;
  for (const character of line) {
    const width = encoder.encode(character).length;
    if (bytes + width > 75) {
      output += "\r\n ";
      bytes = 1;
    }
    output += character;
    bytes += width;
  }
  return output;
}

export function createCalendarFile(race: Race, now: number) {
  const schedule = confirmedSchedule(race);
  if (!schedule) return;

  const end = validEnd(schedule.startAt, schedule.endAt);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MFG Motorsport//Competition Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + escapeText(race.id) + "@mfg-motorsport.local",
    "DTSTAMP:" + timestamp(now),
    "DTSTART:" + timestamp(schedule.startAt),
    ...(end ? ["DTEND:" + timestamp(end)] : []),
    "SUMMARY:" + escapeText(race.title),
    ...(race.location ? ["LOCATION:" + escapeText(race.location)] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
