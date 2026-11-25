"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { ActionLink, MediaSlot, type PortalImage } from "./portal-ui";

export type CarouselSlide = {
  id: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
  image?: PortalImage;
};

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}

function subscribeToMotion(notify: () => void) {
  const query = window.matchMedia(motionPreference);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

export default function Carousel({ slides, heading, label, variant = "home" }: {
  slides: readonly CarouselSlide[]; heading?: string; label: string; variant?: "home" | "series";
}) {
  const t = useTranslations();
  const [{ active, cycle }, setSlide] = useState({ active: 0, cycle: 0 });
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = useSyncExternalStore(
    subscribeToVisibility, () => document.visibilityState === "visible", () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion, () => window.matchMedia(motionPreference).matches, () => true,
  );
  const playing = playback ?? !reducedMotion;
  const running = playing && visible && !hovered && !focused;
  const slide = slides[active];
  const PlaybackIcon = playing ? Pause : Play;

  function move(direction: number) {
    setSlide(({ active, cycle }) => ({
      active: (active + direction + slides.length) % slides.length,
      cycle: cycle + 1,
    }));
  }

  function select(index: number) {
    setSlide(({ cycle }) => ({ active: index, cycle: cycle + 1 }));
  }

  return (
    <section className="hero" data-variant={variant} aria-label={label} aria-roledescription={t("hero.carousel")}>
      {heading && <h1 className="sr-only">{heading}</h1>}
      <div className="hero-stage" aria-live={running ? "off" : "polite"}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className="hero-slide" key={slide.id}>
          <div className="hero-copy">
            <div className="hero-accent" aria-hidden="true" />
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            {slide.action && <ActionLink href={slide.action.href} primary>{slide.action.label}</ActionLink>}
          </div>
          <MediaSlot variant="hero" image={slide.image} loading={variant === "home" ? "eager" : undefined} sizes={variant === "series" ? "(min-width: 1280px) 1216px, 100vw" : undefined} />
        </div>
      </div>
      <div className="carousel-toolbar">
        <div className="slide-progress" aria-label={t("hero.slides")} role="group">
          {slides.map(({ id, title }, index) => (
            <button type="button" key={id} aria-label={title}
              aria-current={index === active ? "true" : undefined} onClick={() => select(index)}>
              <span className="slide-progress-track" aria-hidden="true">
                {index === active && (
                  <span key={cycle} className="slide-progress-fill" data-running={running}
                    onAnimationEnd={() => move(1)} />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="carousel-arrows">
          <button type="button" aria-label={playing ? t("hero.pause") : t("hero.play")}
            onClick={() => setPlayback(!playing)}><PlaybackIcon size={17} aria-hidden="true" /></button>
          <button type="button" aria-label={t("hero.previous")} onClick={() => move(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
          <button type="button" aria-label={t("hero.next")} onClick={() => move(1)}><ChevronRight size={22} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
