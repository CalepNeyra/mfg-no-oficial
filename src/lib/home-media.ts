import type { PortalImage } from "@/components/portal-ui";

// Decorative artwork. Replace these paths with approved editorial photography as it becomes available.
export const homeMedia = {
  about: { src: "/images/home/about.webp", alt: "" },
  calendar: { src: "/images/home/motorsport.webp", alt: "" },
  "super-series": { src: "/images/home/super-series.webp", alt: "" },
  "freshman-series": { src: "/images/home/freshman-series.webp", alt: "" },
  registration: { src: "/images/home/participation.webp", alt: "" },
} satisfies Record<string, PortalImage>;
