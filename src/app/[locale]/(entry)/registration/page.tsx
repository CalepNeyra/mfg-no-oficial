import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/page-intro";
import { RegistrationForm } from "@/components/registration-form";
import { Link } from "@/i18n/navigation";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";
import "./registration.css";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "entry" });
  return { title: t("title"), description: t("description"), alternates: pageAlternates(locale, "/registration") };
}

export default async function RegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("entry");

  return (
    <>
      <div className="entry-intro"><PageIntro title={t("title")} description={t("description")} /></div>
      <div className="shell page-content registration-layout">
        <aside className="portal-panel" aria-labelledby="entry-requirements">
          <h2 id="entry-requirements">{t("requirementsTitle")}</h2>
          <p>{t("requirementsBody")}</p>
          <Link className="text-link" href="#status">{t("statusTitle")}</Link>
        </aside>
        <RegistrationForm />
      </div>
    </>
  );
}
