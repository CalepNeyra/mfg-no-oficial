import type { Metadata } from "next";
import { connection } from "next/server";
import { Trophy } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StandingsHub } from "@/components/standings/standings-hub";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { publicDriverHref } from "@/lib/public-information";
import { publicStandingsData } from "@/lib/championship-data";
import { developmentStandings } from "@/lib/championship-preview";
import "flag-icons/css/flag-icons.min.css";
import "./standings.css";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ preview?: string | string[] }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "championship" });
  return { title: t("title"), description: t("intro"), alternates: pageAlternates(locale, "/standings"),
    robots: (await searchParams).preview === "1" ? { index: false } : undefined };
}

export default async function StandingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("championship");
  await connection();
  const preview = process.env.NODE_ENV === "development" && (await searchParams).preview === "1";
  const data = preview ? developmentStandings(locale) : publicStandingsData();

  const championships = data.championships.map((championship) => ({
    ...championship,
    drivers: championship.drivers.map((driver) => ({
      ...driver,
      href: preview ? undefined : publicDriverHref(driver.id),
    })),
  }));

  return <div className="championship-page">
    <div className="stand-heading"><div className="shell">
      <div><h1>{t("title")}</h1><p>{t("intro")}</p></div><Trophy size={39} strokeWidth={1.4} aria-hidden="true" />
    </div></div>
    <StandingsHub {...data} championships={championships} preview={preview} />
  </div>;
}
