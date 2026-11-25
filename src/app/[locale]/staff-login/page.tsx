import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LockKeyhole } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { EmptyState } from "@/components/portal-ui";
import { pageAlternates } from "@/i18n/metadata";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "staff" });
  return {
    title: t("title"), description: t("description"),
    alternates: pageAlternates(locale, "/staff-login"), robots: { index: false },
  };
}

export default async function StaffLogin({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("staff");
  return (
    <>
      <PageIntro title={t("title")} description={t("description")} />
      <div className="shell page-content">
        <section className="portal-panel staff-panel" aria-label={t("title")}>
          <EmptyState icon={LockKeyhole}>{t("unavailable")}</EmptyState>
          <fieldset className="form-fields" disabled>
            <label>{t("email")}<input type="email" autoComplete="off" /></label>
            <label>{t("password")}<input type="password" autoComplete="off" /></label>
            <button className="action action-primary" type="button">{t("signIn")}</button>
          </fieldset>
        </section>
      </div>
    </>
  );
}
