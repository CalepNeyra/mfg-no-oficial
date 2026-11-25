import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RegistrationDraftProvider } from "@/components/registration/draft-provider";
import { routing } from "@/i18n/routing";
import { entryCatalog } from "@/lib/registration/catalog";

export default async function EntryLayout({ children, params }: {
  children: ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return <RegistrationDraftProvider catalog={entryCatalog[locale]}>{children}</RegistrationDraftProvider>;
}
