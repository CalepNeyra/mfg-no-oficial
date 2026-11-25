import { useTranslations } from "next-intl";
import { homeMedia } from "@/lib/home-media";
import Carousel from "./carousel";

const homeSlides = [
  { id: "calendar", href: "/about" },
  { id: "super-series", href: "/super-series" },
  { id: "freshman-series", href: "/freshman-series" },
  { id: "registration", href: "/registration" },
] as const;

export function HeroCarousel() {
  const t = useTranslations();
  const slides = homeSlides.map(({ id, href }) => ({
    id,
    image: homeMedia[id],
    title: id === "calendar" ? "MFG Motorsport" : id === "registration" ? t("hero.registration.title") : t(`divisions.${id}.title`),
    description: t(`hero.${id}.description`),
    action: { href, label: t(`hero.${id}.action`) },
  }));
  return <Carousel slides={slides} heading="MFG Motorsport" label={t("hero.region")} />;
}
