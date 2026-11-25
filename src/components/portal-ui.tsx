import { Link } from "@/i18n/navigation";
import Image, { type ImageProps } from "next/image";
import { ImageIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type PortalImage = Pick<ImageProps, "src" | "alt">;

export function MediaSlot({ variant, image, sizes, loading }: {
  variant: "hero" | "super" | "freshman" | "circuit" | "editorial";
  image?: PortalImage;
  sizes?: string;
  loading?: ImageProps["loading"];
}) {
  return (
    <div className={`media-slot media-${variant}`} aria-hidden={image ? undefined : true}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill loading={loading}
          sizes={sizes ?? (variant === "hero" ? "(max-width: 720px) 100vw, 68vw" : "(max-width: 720px) 100vw, 550px")} />
      ) : <ImageIcon className="media-icon" size={24} strokeWidth={1.35} />}
    </div>
  );
}

export function ActionLink({ href, children, primary = false }: {
  href: string; children: ReactNode; primary?: boolean;
}) {
  return <Link className={primary ? "action action-primary" : "action"} href={href}>{children}</Link>;
}

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="empty-state">
      <Icon size={20} strokeWidth={1.65} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export function SectionHeading({ id, children, link }: {
  id: string; children: ReactNode; link?: { href: string; label: string };
}) {
  return (
    <div className="section-heading">
      <h2 id={id}>{children}</h2>
      {link && <Link className="text-link" href={link.href}>{link.label}</Link>}
    </div>
  );
}
