"use client";

import { CalendarDays, Clock3, Flag, MapPin, Route } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { googleCalendarHref } from "@/lib/calendar-export";
import { raceResources, type Race } from "@/lib/race-schedule";
import { EmptyState, MediaSlot } from "../portal-ui";
import { SeriesIdentity } from "../series-identity";
import { ZoneSelect } from "./calendar-filters";
import { useCalendarQuery } from "./calendar-url";
import { CalendarPreviewNotice, RaceDate, RaceStatusBadge, SessionTime } from "./event-card";

export function RaceDetails({ race, season, preview, standingsHref, courseHref }: { race: Race; season?: string; preview: boolean; standingsHref?: string; courseHref?: string }) {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const portal = useTranslations();
  const format = useFormatter();
  const { query, update, zone } = useCalendarQuery();
  const back = query.toString();
  const external = googleCalendarHref(race);
  const exportQuery = new URLSearchParams({ locale });
  if (preview) exportQuery.set("preview", "1");
  const ics = "/api/calendar/" + encodeURIComponent(race.id) + "?" + exportQuery.toString();
  const available = raceResources.filter((key) => key !== "entries" && race.resources?.[key]);
  const sessions = [...(race.sessions ?? [])].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const course = race.course;

  return (
    <div className="shell calendar-content race-details" data-division={race.division}>
      {preview && <CalendarPreviewNotice />}
      <Link className="text-link" href={"/calendar" + (back ? "?" + back : "")}>{t("back")}</Link>
      <header className="race-detail-heading">
        <MediaSlot variant="circuit" image={race.image} loading="eager" sizes="100vw" />
        <div>
          <SeriesIdentity division={race.division} as="p" />
          <div className="event-meta">
            <span>{t("round", { round: race.round })}</span>
            {season && <span>{t("seasonLabel", { season })}</span>}
            <RaceStatusBadge state={race.state} />
          </div>
          <h1>{race.title}</h1>
          <div className="event-facts">
            <p><Clock3 size={16} aria-hidden="true" /><RaceDate schedule={race.schedule} zone={zone} /></p>
            {race.location && <p><MapPin size={16} aria-hidden="true" />{race.location}</p>}
          </div>
        </div>
      </header>
      <div className="race-detail-actions">
        <ZoneSelect value={query.get("tz") === "local" ? "local" : "jst"}
          onChange={(value) => update("tz", value === "local" ? value : null)} />
        {external && (
          <section aria-labelledby="export-title">
            <h2 id="export-title">{t("add")}</h2>
            <div>
              <a className="action action-primary" href={ics} download>{t("download")}</a>
              <a className="action" href={external} target="_blank" rel="noreferrer">Google Calendar</a>
            </div>
            <p>{t("importHint")}</p>
          </section>
        )}
      </div>
      <div className="race-detail-grid">
        <section aria-labelledby="course-title">
          <h2 id="course-title">{t("courseTitle")}</h2>
          {courseHref && <Link className="text-link" href={courseHref}>{portal("information.circuitDetails")}</Link>}
          {course ? (
            <div className="race-document">
              <h3>{course.name}</h3>
              <dl>
                {course.lengthKm !== undefined && <div><dt>{t("length")}</dt><dd>{format.number(course.lengthKm, { style: "unit", unit: "kilometer" })}</dd></div>}
                {course.layout && <div><dt>{t("layout")}</dt><dd>{course.layout}</dd></div>}
                {course.elevationM !== undefined && <div><dt>{t("elevation")}</dt><dd>{format.number(course.elevationM, { style: "unit", unit: "meter" })}</dd></div>}
              </dl>
              {course.description && <p>{course.description}</p>}
              {course.features && course.features.length > 0 && <ul>{course.features.map((item) => <li key={item}>{item}</li>)}</ul>}
              {course.map && <figure><MediaSlot variant="circuit" image={course.map} /><figcaption>{t("map")}</figcaption></figure>}
              {course.photos && course.photos.length > 0 && (
                <div className="race-media">{course.photos.map((image, index) => <MediaSlot key={index} variant="circuit" image={image} />)}</div>
              )}
            </div>
          ) : <EmptyState icon={Route}>{t("courseEmpty")}</EmptyState>}
        </section>
        <section aria-labelledby="program-title">
          <h2 id="program-title">{t("program")}</h2>
          {sessions.length ? (
            <ol className="race-program">
              {sessions.map(({ id, kind, title, startAt, endAt }) => <li key={id}>
                <strong>{title ?? t(`session.${kind}`)}</strong><SessionTime start={startAt} end={endAt} zone={zone} full />
              </li>)}
            </ol>
          ) : <EmptyState icon={CalendarDays}>{t("programEmpty")}</EmptyState>}
        </section>
        <section aria-labelledby="sport-title">
          <h2 id="sport-title">{t("sport")}</h2>
          {available.length || standingsHref ? <ul className="race-sport">
            {standingsHref && <li><Link className="text-link" href={standingsHref}>{portal("championship.title")}</Link></li>}
            {available.map((key) => {
            const href = race.resources?.[key];
            return href && <li key={key}>{href.startsWith("/") && !href.startsWith("//")
              ? <Link className="text-link" href={href}>{t(`resource.${key}`)}</Link>
              : <a className="text-link" href={href}>{t(`resource.${key}`)}</a>}</li>;
          })}</ul> : <EmptyState icon={Flag}>{t("sportEmpty")}</EmptyState>}
        </section>
        {race.gallery && race.gallery.length > 0 && (
          <section aria-labelledby="race-gallery">
            <h2 id="race-gallery">{t("gallery")}</h2>
            <div className="race-media">{race.gallery.map(({ title, image, video }) => <figure key={title}>
              {video ? <video controls preload="metadata" aria-label={title} src={video} /> : <MediaSlot variant="editorial" image={image} />}
              <figcaption>{title}</figcaption>
            </figure>)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
