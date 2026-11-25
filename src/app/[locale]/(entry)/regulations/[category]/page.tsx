import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { RegulationDocument } from "@/components/registration/regulation-document";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { isCategory } from "@/lib/registration/catalog";
import { regulationHref } from "@/lib/registration/regulations";
import "../regulations.css";

type Props = {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isCategory(category)) notFound();
  const t = await getTranslations({ locale });
  return {
    title: t("regulation.title", { series: t(`divisions.${category}.title`) }),
    description: t("regulation.description"),
    alternates: pageAlternates(locale, regulationHref(category)),
  };
}

export default async function RegulationPage({ params, searchParams }: Props) {
  const { locale, category } = await params;
  if (!isCategory(category)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <>
      <PageIntro title={t("regulation.title", { series: t(`divisions.${category}.title`) })}
        description={t("regulation.description")} category={t(`divisions.${category}.level`)} division={category} />
      <RegulationDocument category={category} fromRegistration={(await searchParams).from === "registration"} />
    </>
  );
}
