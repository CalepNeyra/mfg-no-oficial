import { CalendarDays, ChevronDown, ClipboardList, Flag, Gauge, Info, Mail, Newspaper, ScrollText, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { homeMedia } from "@/lib/home-media";
import { divisionSlugs } from "@/lib/portal";
import { ActionLink, EmptyState, MediaSlot } from "./portal-ui";
import { PageIntro } from "./page-intro";
import { SeriesIdentity } from "./series-identity";
import { InformationHeading, InformationLinks } from "./information/information-layout";

export const organizationPages = ["about", "contact", "faq", "privacy", "terms"] as const;
export type OrganizationSlug = (typeof organizationPages)[number];

const helpTopics = [
  { key: "general", href: "/about", label: "front.aboutTitle", icon: Info },
  { key: "championships", href: "/about#divisions", label: "front.championships", icon: Flag },
  { key: "registration", href: "/registration", label: "nav.registration", icon: ClipboardList },
  { key: "requirements", href: "/registration#entry-requirements", label: "entry.requirementsTitle", icon: ScrollText },
  { key: "technical", href: "/regulations", label: "sections.regulations.title", icon: Gauge },
  { key: "calendar", href: "/calendar", label: "home.calendarLink", icon: CalendarDays },
] as const;

const contactTopics = [
  { key: "general", href: "/faq", label: "front.info.faq.title", icon: Mail },
  { key: "sport", href: "/calendar", label: "home.calendarLink", icon: Flag },
  { key: "registration", href: "/registration", label: "nav.registration", icon: ClipboardList },
  { key: "technical", href: "/regulations", label: "sections.regulations.title", icon: Gauge },
  { key: "media", href: "/news", label: "home.newsLink", icon: Newspaper },
] as const;

async function AboutContent() {
  const t = await getTranslations();
  return <div className="shell info-content">
    <article className="info-about-lead">
      <MediaSlot variant="hero" image={homeMedia.about} loading="eager" />
      <div><h2>MFG Motorsport</h2><p>{t("front.aboutIntro")}</p></div>
    </article>
    <div className="info-editorial-grid">
      <section className="info-panel"><h2>{t("information.origins")}</h2><p>{t("information.originsText")}</p></section>
      <section className="info-panel"><h2>{t("information.structure")}</h2><p>{t("information.structureText")}</p>
        <InformationLinks><ActionLink href="/calendar">{t("home.calendarLink")}</ActionLink>
          <ActionLink href="/regulations">{t("sections.regulations.title")}</ActionLink></InformationLinks>
      </section>
    </div>
    <section id="divisions" aria-labelledby="info-divisions-title">
      <h2 className="info-section-title" id="info-divisions-title">{t("front.championships")}</h2>
      <div className="info-editorial-grid">
        {divisionSlugs.map((division) => <article key={division} className="info-division" data-division={division}>
          <MediaSlot variant={division === "super-series" ? "super" : "freshman"} image={homeMedia[division]} />
          <div className="info-panel">
            <SeriesIdentity division={division} as="h3" />
            <p>{t(`seriesPage.${division}.introduction`)}</p>
            <ActionLink href={`/${division}`}>{t("front.explore")}</ActionLink>
          </div>
        </article>)}
      </div>
    </section>
    <p className="info-note">{t("footer.notice")}</p>
  </div>;
}

async function FaqContent() {
  const t = await getTranslations();
  return <div className="shell info-content">
    <div className="info-faq">
      {helpTopics.map(({ key, href, label, icon: Icon }) => (
        <details key={key} suppressHydrationWarning>
          <summary>
            <Icon size={20} aria-hidden="true" />
            <span><strong>{t(`information.faq.${key}.category`)}</strong>{t(`information.faq.${key}.question`)}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div><p>{t(`information.faq.${key}.answer`)}</p><ActionLink href={href}>{t(label)}</ActionLink></div>
        </details>
      ))}
    </div>
  </div>;
}

async function ContactContent() {
  const t = await getTranslations();
  return <div className="shell info-content">
    <p className="info-note">{t("footer.contact")}</p>
    <div className="info-directory-grid">
      {contactTopics.map(({ key, href, label, icon: Icon }) => <article className="info-panel info-contact" key={key}>
        <Icon size={23} aria-hidden="true" /><h2>{t(`information.contact.${key}.title`)}</h2>
        <p>{t(`information.contact.${key}.body`)}</p>
        <ActionLink href={href}>{t(label)}</ActionLink>
      </article>)}
    </div>
  </div>;
}

export async function OrganizationPage({ slug }: { slug: OrganizationSlug }) {
  const t = await getTranslations();
  const title = t(`front.info.${slug}.title`);
  const description = t(`front.info.${slug}.description`);
  if (slug === "privacy" || slug === "terms") {
    return <><PageIntro title={title} description={description} />
      <div className="shell page-content"><EmptyState icon={Info}>{t("front.policyPending")}</EmptyState></div>
    </>;
  }

  const Icon = slug === "about" ? UsersRound : slug === "faq" ? Info : Mail;
  return <div className="information-page">
    <InformationHeading title={title} description={description} icon={Icon} />
    {slug === "about" ? <AboutContent /> : slug === "faq" ? <FaqContent /> : <ContactContent />}
  </div>;
}
