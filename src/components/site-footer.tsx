import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { divisionSlugs } from "@/lib/portal";
import { socialProfiles } from "@/lib/social-links";
import { BackToTop, FooterYear } from "./footer-controls";
import { LanguageSwitcher } from "./language-switcher";
import { SeriesIdentity } from "./series-identity";
import { SocialLinks } from "./social-links";
import { Wordmark } from "./wordmark";
import "./site-footer.css";

type FooterLink = { href: string; label: string };

function FooterLinks({ links }: { links: readonly FooterLink[] }) {
  return <ul>{links.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>;
}

function getYear() {
  return new Date().getFullYear();
}

export function SiteFooter() {
  const t = useTranslations();
  const competition = ["calendar", "standings", "results", "drivers", "circuits"] as const;
  const groups = [
    { id: "championships", title: t("footer.championships"), links: divisionSlugs.map((slug) => ({
      href: `/${slug}`, label: `MFG ${t(`divisions.${slug}.title`)}`,
    })) },
    { id: "competition", title: t("nav.competition"), links: competition.map((slug) => ({
      href: `/${slug}`, label: t(slug === "circuits" ? "information.circuits" : `sections.${slug}.title`),
    })) },
    { id: "participation", title: t("footer.participation"), links: [
      { href: "/registration", label: t("nav.registration") },
      { href: "/registration#entry-requirements", label: t("entry.requirementsTitle") },
      { href: "/regulations", label: t("sections.regulations.title") },
      { href: "/faq", label: t("front.info.faq.title") },
    ] },
    { id: "organization", title: t("footer.organization"), links: [
      { href: "/about", label: t("front.aboutTitle") },
      { href: "/news", label: t("sections.news.title") },
      { href: "/contact", label: t("front.info.contact.title") },
      { href: "/staff-login", label: t("nav.staff") },
    ] },
  ];

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-institutional">
          <div className="footer-brand">
            <Wordmark />
            <p>{t("front.footerAbout")}</p>
          </div>
          <div className="footer-series">
            {divisionSlugs.map((division) => (
              <Link key={division} href={`/${division}`} data-division={division}>
                <SeriesIdentity division={division} as="p" />
              </Link>
            ))}
          </div>
          <BackToTop />
        </div>
        <nav aria-label={t("footer.label")} className="footer-directory">
          <div className="footer-columns">
            {groups.map(({ id, title, links }) => (
              <section key={id} aria-labelledby={`footer-${id}`}>
                <h2 id={`footer-${id}`}>{title}</h2>
                <FooterLinks links={links} />
              </section>
            ))}
          </div>
          <div className="footer-disclosures">
            {groups.map(({ id, title, links }) => (
              <details key={id}>
                <summary>{title}<ChevronDown size={17} aria-hidden="true" /></summary>
                <FooterLinks links={links} />
              </details>
            ))}
          </div>
        </nav>
        <div className="footer-utilities">
          <LanguageSwitcher className="languages footer-languages" />
          <SocialLinks profiles={socialProfiles} />
        </div>
      </div>
      <div className="footer-legal">
        <div className="shell footer-legal-inner">
          <FooterYear initialYear={getYear()} />
          <div className="footer-policy">
            <Link href="/privacy">{t("footer.privacy")}</Link>
            <Link href="/terms">{t("footer.terms")}</Link>
          </div>
          <p className="footer-notice">{t("footer.notice")}</p>
        </div>
      </div>
    </footer>
  );
}
