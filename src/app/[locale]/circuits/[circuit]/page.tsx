import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Flag, Route } from "lucide-react";
import { InformationHeading } from "@/components/information/information-layout";
import { EmptyState, MediaSlot } from "@/components/portal-ui";
import { pageAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { circuitHref, findCircuit, racesAtCircuit } from "@/lib/public-information";
import { japanTime, raceHref, sortRaces } from "@/lib/race-schedule";
import "../../information.css";

type Props = { params: Promise<{ locale: Locale; circuit: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, circuit } = await params;
  const profile = findCircuit(circuit);
  if (!profile) notFound();
  return { title: profile.name, description: profile.description, alternates: pageAlternates(locale, circuitHref(circuit)) };
}

export default async function CircuitDetail({ params }: Props) {
  const { locale, circuit } = await params;
  setRequestLocale(locale);
  const course = findCircuit(circuit);
  if (!course) notFound();
  const t = await getTranslations();
  const format = await getFormatter();
  const races = sortRaces(racesAtCircuit(circuit).filter(({ state }) => state === "finished")).reverse();

  return <div className="information-page">
    <InformationHeading title={course.name} description={course.location} icon={Route} />
    <div className="shell info-content">
      <Link className="text-link" href="/circuits">{t("information.backCircuits")}</Link>
      <article className="info-panel info-course">
        {course.image && <MediaSlot variant="circuit" image={course.image} loading="eager" />}
        {course.divisions.length > 0 && <p className="overline">{course.divisions.map((division) => t(`divisions.${division}.title`)).join(" · ")}</p>}
        <h2>{t("schedule.courseTitle")}</h2>
        {course.description && <p>{course.description}</p>}
        <dl className="info-facts">
          {course.lengthKm !== undefined && <div><dt>{t("schedule.length")}</dt><dd>{format.number(course.lengthKm, { style: "unit", unit: "kilometer" })}</dd></div>}
          {course.layout && <div><dt>{t("schedule.layout")}</dt><dd>{course.layout}</dd></div>}
          {course.elevationM !== undefined && <div><dt>{t("schedule.elevation")}</dt><dd>{format.number(course.elevationM, { style: "unit", unit: "meter" })}</dd></div>}
        </dl>
        {course.features && course.features.length > 0 && <ul className="info-feature-list">{course.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
        {course.map && <figure><MediaSlot variant="circuit" image={course.map} /><figcaption>{t("schedule.map")}</figcaption></figure>}
        {course.sectors && course.sectors.length > 0 && <div className="info-sector">
          <h3>{t("information.sectors")}</h3>
          <ol>{course.sectors.map(({ name, description }) => <li key={name}><strong>{name}</strong>{description && <p>{description}</p>}</li>)}</ol>
        </div>}
        {course.photographs && course.photographs.length > 0 && <div className="info-directory-grid">
          {course.photographs.map((image, index) => <MediaSlot key={index} variant="circuit" image={image} />)}
        </div>}
      </article>
      <section className="info-panel" aria-labelledby="circuit-history">
        <h2 id="circuit-history">{t("information.circuitHistory")}</h2>
        {races.length ? <ul className="info-event-history">{races.map((race) => <li key={race.id}>
          <Link className="text-link" href={raceHref(race.id)}>{race.title}</Link>
          <span>{t(`divisions.${race.division}.title`)}</span>
          {race.schedule && <time dateTime={race.schedule.startAt}>{format.dateTime(new Date(race.schedule.startAt), { dateStyle: "long", timeZone: japanTime })}</time>}
        </li>)}</ul> : <EmptyState icon={Flag}>{t("information.historyPending")}</EmptyState>}
      </section>
    </div>
  </div>;
}
