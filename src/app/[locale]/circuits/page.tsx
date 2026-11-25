import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Route } from "lucide-react";
import { InformationDirectory } from "@/components/information/directory";
import { InformationHeading } from "@/components/information/information-layout";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import { publicCircuits } from "@/lib/public-information";
import "../information.css";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "information" });
  return { title: t("circuits"), description: t("circuitsIntro"), alternates: pageAlternates(locale, "/circuits") };
}

export default async function CircuitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations("information");

  return <div className="information-page">
    <InformationHeading title={t("circuits")} description={t("circuitsIntro")} icon={Route} />
    <InformationDirectory kind="circuits" records={publicCircuits()} />
  </div>;
}
