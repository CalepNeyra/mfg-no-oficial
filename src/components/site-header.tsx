"use client";

import { Check, ChevronDown, Menu, UserRound, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { divisionSlugs, informationMenu, mainSections } from "@/lib/portal";
import { socialProfiles } from "@/lib/social-links";
import { LanguageSwitcher } from "./language-switcher";
import { SocialLinks } from "./social-links";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const open = openForPath === pathname;

  const closeDropdowns = useCallback((except?: HTMLDetailsElement | null) => {
    header.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((details) => {
      if (details !== except) details.open = false;
    });
  }, []);

  const closeMenus = useCallback(() => {
    setOpenForPath(null);
    closeDropdowns();
  }, [closeDropdowns]);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) closeMenus();
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [closeMenus]);

  function renderLink(href: string, label: string, className?: string, inDropdown = false, Icon?: LucideIcon) {
    return (
      <Link key={href} href={href} onClick={closeMenus} className={className}
        aria-current={pathname === href ? "page" : undefined}>
        <span className="nav-link-label">{Icon && <Icon size={17} aria-hidden="true" />}{label}</span>{inDropdown && pathname === href && <Check size={16} aria-hidden="true" />}
      </Link>
    );
  }

  function renderMenu(label: string, links: readonly { href: string; label: string; icon?: LucideIcon }[], menu?: "information") {
    return (
      <details className="nav-group" data-menu={menu} data-active={links.some(({ href }) => href === pathname || pathname.startsWith(href + "/"))}>
        <summary onClick={(event) => closeDropdowns(event.currentTarget.closest("details"))}>
          {label}<ChevronDown size={15} aria-hidden="true" />
        </summary>
        <div className="nav-dropdown">{links.map(({ href, label, icon }) => renderLink(href, label, undefined, true, icon))}</div>
      </details>
    );
  }

  return (
    <header id="site-top" className="site-header" tabIndex={-1} ref={header} onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      const dropdown = header.current?.querySelector<HTMLDetailsElement>("details[open]");
      if (dropdown) {
        closeDropdowns();
        dropdown.querySelector("summary")?.focus();
      } else if (open) {
        closeMenus();
        mobileToggle.current?.focus();
      }
    }}>
      <div className="institutional-bar">
        <div className="shell institutional-inner">
          <span className="institutional-brand">MFG MOTORSPORT</span>
          <div className="institutional-actions">
            <Link className="staff-link" href="/staff-login" onClick={closeMenus} title={t("nav.staff")}
              aria-current={pathname === "/staff-login" ? "page" : undefined}>
              <UserRound size={16} aria-hidden="true" />
              <span className="staff-label">{t("nav.staff")}</span>
            </Link>
            <LanguageSwitcher onChange={closeMenus} />
            <SocialLinks profiles={socialProfiles} />
          </div>
        </div>
      </div>
      <div className="shell header-inner">
        <div onClick={closeMenus}><Wordmark /></div>
        <button className="mobile-toggle" type="button" ref={mobileToggle}
          aria-controls="main-navigation" aria-expanded={open}
          onClick={() => open ? closeMenus() : setOpenForPath(pathname)}>
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />} {t("nav.menu")}
        </button>
        <nav id="main-navigation" className="navigation" data-open={open} aria-label={t("nav.primary")}>
          {renderLink("/", t("common.home"))}
          {renderMenu(t("nav.series"), divisionSlugs.map((slug) => ({ href: `/${slug}`, label: t(`divisions.${slug}.title`) })))}
          {mainSections.map((slug) => renderLink(`/${slug}`, t(`sections.${slug}.title`)))}
          {renderMenu(t("nav.information"), informationMenu.map(({ href, label, icon }) => ({ href, label: t(label), icon })), "information")}
          {renderLink("/registration", t("nav.registration"), "registration-link")}
        </nav>
      </div>
    </header>
  );
}
