import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ScrollText } from "lucide-react";
import { InformationHeading } from "@/components/information/information-layout";
import { RegulationsContent } from "@/components/regulations-content";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

import "../../information.css";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sections.regulations" });
  return { title: t("title"), description: t("description"), alternates: pageAlternates(locale, "/regulations") };
}

export default async function RegulationsDirectory({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="information-page">
      <InformationHeading title={t("sections.regulations.title")} description={t("sections.regulations.description")} icon={ScrollText} />
      <div className="shell info-content"><RegulationsContent /></div>
    </div>
  );
}
