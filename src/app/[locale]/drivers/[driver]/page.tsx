import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Flag, UserRound } from "lucide-react";
import { InformationHeading } from "@/components/information/information-layout";
import { EmptyState, MediaSlot } from "@/components/portal-ui";
import { SeriesIdentity } from "@/components/series-identity";
import { pageAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { driverHistory, driverHref, findDriver } from "@/lib/public-information";
import "../../information.css";

type Props = { params: Promise<{ locale: Locale; driver: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, driver } = await params;
  const profile = findDriver(driver);
  if (!profile) notFound();
  return { title: profile.name, alternates: pageAlternates(locale, driverHref(driver)) };
}

export default async function DriverDetail({ params }: Props) {
  const { locale, driver } = await params;
  setRequestLocale(locale);
  const profile = findDriver(driver);
  if (!profile) notFound();
  const t = await getTranslations();
  const format = await getFormatter();
  const country = profile.countryCode && /^[A-Z]{2}$/.test(profile.countryCode)
    ? new Intl.DisplayNames(locale, { type: "region" }).of(profile.countryCode) : undefined;
  const history = driverHistory(profile);
  const car = profile.vehicle;
  const vehicleName = [profile.manufacturer, profile.model].filter(Boolean).join(" ");
  const facts = [
    { label: t("information.engine"), value: car?.engine },
    { label: t("information.power"), value: car?.powerPs === undefined ? undefined : format.number(car.powerPs) + " PS" },
    { label: t("information.weight"), value: car?.weightKg === undefined ? undefined : format.number(car.weightKg, { style: "unit", unit: "kilogram" }) },
    { label: t("information.drivetrain"), value: car?.drivetrain },
    { label: t("information.transmission"), value: car?.transmission },
  ].filter(({ value }) => value);

  return <div className="information-page">
    <InformationHeading title={profile.name} description={country} icon={UserRound} />
    <div className="shell info-content">
      <Link className="text-link" href={`/drivers?series=${profile.division}`}>{t("information.backDrivers")}</Link>
      <article className="info-profile-head" data-division={profile.division}>
        {profile.photograph && <MediaSlot variant="editorial" image={profile.photograph} />}
        <div>
          <SeriesIdentity division={profile.division} as="p" />
          <strong className="info-profile-bib">#{profile.number}</strong>
          {profile.biography && <p>{profile.biography}</p>}
        </div>
      </article>
      <section className="info-panel" id="vehicle" aria-labelledby="vehicle-title">
        <h2 id="vehicle-title">{t("information.vehicle")}</h2>
        {vehicleName && <p className="info-lede">{vehicleName}</p>}
        {car?.photograph && <MediaSlot variant="circuit" image={car.photograph} />}
        {facts.length ? <dl className="info-facts">{facts.map(({ label, value }) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}</dl> : <p>{t("information.vehiclePending")}</p>}
      </section>
      <section className="info-panel" aria-labelledby="history-title">
        <h2 id="history-title">{t("information.history")}</h2>
        {history.length ? history.map((season) => <article className="info-season" key={season.id}>
          <h3>{t(`divisions.${season.division}.title`)}{season.season ? " · " + season.season : ""}</h3>
          <dl className="info-facts"><div><dt>{t("championship.field.wins")}</dt><dd>{format.number(season.wins)}</dd></div>
            {season.points !== undefined && <div><dt>{t("championship.field.points")}</dt><dd>{format.number(season.points)}</dd></div>}</dl>
          <ul>{season.rounds.map((round) => <li key={round.id}>
            {round.href ? <Link className="text-link" href={round.href}>{round.title}</Link> : round.title}
            <span>{round.position === undefined ? t(`championship.outcome.${round.outcome}`) : t("information.finish", { position: round.position })}</span>
            {round.points !== undefined && <span>{t("information.points", { value: format.number(round.points) })}</span>}
          </li>)}</ul>
        </article>) : <EmptyState icon={Flag}>{t("information.historyPending")}</EmptyState>}
      </section>
    </div>
  </div>;
}
