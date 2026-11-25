import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { EditorialNews } from "@/components/editorial-news";
import { OrganizationPage, organizationPages } from "@/components/organization-page";
import { PageIntro } from "@/components/page-intro";
import { EmptyState } from "@/components/portal-ui";
import { SeriesPage } from "@/components/series-page";
import { pageAlternates } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Division } from "@/lib/competition";
import { divisions, divisionSlugs, sections } from "@/lib/portal";

import "../information.css";

const legacyPaths = { cars: "/drivers", "entry-list": "/registration" } as const;
const separateRoutes = ["calendar", "standings", "regulations", "drivers", "circuits"];

function legacyPath(section: string) {
  return Object.hasOwn(legacyPaths, section) ? legacyPaths[section as keyof typeof legacyPaths] : undefined;
}

type Props = {
  params: Promise<{ locale: Locale; section: string }>;
  searchParams: Promise<{ series?: string | string[] }>;
};

export function generateStaticParams() {
  return [...Object.keys(divisions), ...Object.keys(sections), ...organizationPages].filter((section) => !separateRoutes.includes(section) && !legacyPath(section)).map((section) => ({ section }));
}

function getPage(section: string) {
  const organizationSlug = organizationPages.find((slug) => slug === section);
  if (organizationSlug) return { kind: "front.info" as const, slug: organizationSlug };
  if (Object.hasOwn(divisions, section)) {
    return { kind: "divisions" as const, slug: section as Division };
  }
  if (Object.hasOwn(sections, section)) {
    const slug = section as keyof typeof sections;
    return { kind: "sections" as const, slug, ...sections[slug] };
  }
  notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, section } = await params;
  if (legacyPath(section)) return { robots: { index: false } };
  const { kind, slug } = getPage(section);
  const t = await getTranslations({ locale, namespace: `${kind}.${slug}` });
  return { title: t("title"), description: t("description"), alternates: pageAlternates(locale, `/${section}`) };
}

async function PageContent({ slug, division }: { slug: keyof typeof sections; division?: Division }) {
  const t = await getTranslations("sections");
  switch (slug) {
    case "news": return <EditorialNews division={division} />;
  }
  return <EmptyState icon={sections[slug].icon}>{t(`${slug}.empty`)}</EmptyState>;
}

export default async function PortalPage({ params, searchParams }: Props) {
  const { locale, section } = await params;
  setRequestLocale(locale);
  const destination = legacyPath(section);
  if (destination) {
    const legacyDivision = (await searchParams).series;
    const division = divisionSlugs.find((slug) => slug === legacyDivision);
    permanentRedirect(`/${locale}${destination}${destination === "/drivers" && division ? "?series=" + division : ""}`);
  }
  const page = getPage(section);
  if (page.kind === "front.info") return <OrganizationPage slug={page.slug} />;
  if (page.kind === "divisions") return <SeriesPage division={page.slug} locale={locale} />;

  const selected = (await searchParams).series;
  const division = divisionSlugs.find((slug) => slug === selected);
  const t = await getTranslations();
  return (
    <>
      <PageIntro title={t(`sections.${page.slug}.title`)} description={t(`sections.${page.slug}.description`)}
        category={division ? t(`divisions.${division}.title`) : undefined} division={division} />
      <div className="shell page-content">
        {division && <Link className="text-link series-back" href={`/${division}`}>
          {t("seriesPage.back", { series: t(`divisions.${division}.title`) })}
        </Link>}
        <PageContent slug={page.slug} division={division} />
      </div>
    </>
  );
}
