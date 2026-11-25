import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, CarFront, ClipboardList, Flag, Hash, ListOrdered, LockKeyhole,
  Newspaper, ScrollText, Trophy, UsersRound } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { ActionLink, EmptyState, SectionHeading } from "@/components/portal-ui";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

// The administrative scaffold is server-only until a staff session provider is configured.
const staffAccessConfigured: boolean = false;

const modules = [
  ["nav.registration", ClipboardList], ["sections.drivers.title", UsersRound], ["sections.cars.title", CarFront],
  ["admin.numbers", Hash], ["admin.seasons", Trophy], ["admin.races", CalendarDays],
  ["sections.results.title", Flag], ["sections.standings.title", ListOrdered],
  ["sections.news.title", Newspaper], ["sections.regulations.title", ScrollText],
] as const;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("title"), description: t("description"), alternates: pageAlternates(locale, "/admin"), robots: { index: false } };
}

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  if (!staffAccessConfigured) redirect(`/${locale}/staff-login`);
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageIntro title={t("admin.title")} description={t("admin.description")} />
      <div className="shell page-content">
        <EmptyState icon={LockKeyhole}>{t("admin.locked")}</EmptyState>
        <section className="portal-panel admin-panel" aria-labelledby="admin-modules">
          <SectionHeading id="admin-modules">{t("admin.modules")}</SectionHeading>
          <ul className="admin-modules">
            {modules.map(([label, Icon]) => <li key={label}><Icon size={18} aria-hidden="true" />{t(label)}</li>)}
          </ul>
          <ActionLink href="/staff-login">{t("nav.staff")}</ActionLink>
        </section>
      </div>
    </>
  );
}
