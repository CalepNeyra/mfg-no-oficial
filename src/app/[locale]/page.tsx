import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DivisionCard } from "@/components/division-card";
import { EditorialNews } from "@/components/editorial-news";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeGallery, HomePartners, HomeProfiles, HomeRegistration, HomeResults, HomeSection, NextRace } from "@/components/home-sections";
import { ActionLink, MediaSlot } from "@/components/portal-ui";
import { RaceCalendar } from "@/components/race-calendar";
import { StandingsPreview } from "@/components/standings-preview";
import { pageAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { homeMedia } from "@/lib/home-media";
import { races } from "@/lib/competition";
import { divisionSlugs } from "@/lib/portal";
import "./home.css";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, "/") };
}

const shortcuts = ["news", "series", "calendar", "standings", "participation"] as const;

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const labels = {
    news: t("sections.news.title"), series: t("front.championships"), calendar: t("sections.calendar.title"),
    standings: t("sections.standings.title"), participation: t("nav.registration"),
  };

  return (
    <div className="front">
      <HeroCarousel />
      <NextRace />
      <nav className="front-shortcuts" aria-label={t("front.shortcuts")}>
        <div className="shell">{shortcuts.map((id) => <Link key={id} href={`#${id}`}>{labels[id]}</Link>)}</div>
      </nav>

      <HomeSection id="news" title={t("home.newsTitle")} link={{ href: "/news", label: t("home.newsLink") }}>
        <EditorialNews preview compact />
      </HomeSection>

      <section className="front-about" aria-labelledby="front-about-title">
        <div className="shell front-about-inner">
          <MediaSlot variant="hero" image={homeMedia.about} sizes="(max-width: 800px) 100vw, 55vw" />
          <div>
            <h2 id="front-about-title">{t("front.aboutTitle")}</h2>
            <p>{t("front.aboutIntro")}</p>
            <ActionLink href="/about">{t("front.aboutLink")}</ActionLink>
          </div>
        </div>
      </section>

      <HomeSection id="series" title={labels.series}>
        <div className="front-series-grid">
          {divisionSlugs.map((slug) => <DivisionCard key={slug} slug={slug} />)}
        </div>
      </HomeSection>

      <HomeSection id="calendar" title={t("home.calendarTitle")} tone="paper" link={{ href: "/calendar", label: t("home.calendarLink") }}>
        <RaceCalendar races={races.map(({ id, round, seasonId, title, division, location, state, schedule, image }) => ({ id, round, seasonId, title, division, location, state, schedule, image }))} />
      </HomeSection>

      <HomeSection id="standings" title={labels.standings} link={{ href: "/standings", label: t("home.standingsLink") }}>
        <StandingsPreview preview />
      </HomeSection>

      <HomeSection id="drivers" title={t("seriesPage.featuredDrivers")} tone="paper" link={{ href: "/drivers", label: t("seriesPage.viewDrivers") }}>
        <HomeProfiles />
      </HomeSection>

      <HomeSection id="results" title={t("front.results")} tone="paper" link={{ href: "/results", label: t("sections.results.link") }}>
        <HomeResults />
      </HomeSection>

      <HomeRegistration locale={locale} />

      <HomeSection id="gallery" title={t("front.gallery")}>
        <HomeGallery />
      </HomeSection>

      <HomeSection id="partners" title={t("front.partners")} tone="paper">
        <HomePartners />
      </HomeSection>
    </div>
  );
}
