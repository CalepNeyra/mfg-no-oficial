import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResultsHub } from "@/components/results/results-hub";
import { MediaSlot } from "@/components/portal-ui";
import { SeriesIdentity } from "@/components/series-identity";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { homeMedia } from "@/lib/home-media";
import { divisionSlugs } from "@/lib/portal";
import { publicResultsData } from "@/lib/race-results-data";
import "./results.css";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ series?: string; season?: string; round?: string; session?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sections.results" });
  return { title: t("title"), description: t("description"), alternates: pageAlternates(locale, "/results") };
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await searchParams;
  const t = await getTranslations("sections.results");
  const data = publicResultsData(locale);

  return <div className="results-page">
    <header className="results-hero">
      <MediaSlot variant="hero" image={homeMedia.calendar} loading="eager" sizes="100vw" />
      <div className="shell results-hero-copy">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <div className="results-marks">
          {divisionSlugs.map((division) => <div key={division} data-division={division}><SeriesIdentity division={division} as="p" /></div>)}
        </div>
      </div>
    </header>
    <ResultsHub {...data} />
  </div>;
}
