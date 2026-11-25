import { Instagram, Youtube } from "lucide-react";
import type { SocialPlatform, SocialProfiles } from "@/lib/social-links";

const platforms = [
  { key: "youtube", label: "YouTube", domains: ["youtube.com", "youtu.be"], Icon: Youtube },
  { key: "instagram", label: "Instagram", domains: ["instagram.com"], Icon: Instagram },
  { key: "x", label: "X (Twitter)", domains: ["x.com", "twitter.com"] },
] satisfies readonly { key: SocialPlatform; label: string; domains: readonly string[]; Icon?: typeof Instagram }[];

function isProfileUrl(href: string, domains: readonly string[]) {
  try {
    const url = new URL(href);
    const domain = url.hostname.replace(/^(www|m)\./, "");
    return url.protocol === "https:" && !url.username && !url.password &&
      url.pathname.length > 1 && domains.includes(domain);
  } catch {
    return false;
  }
}

export function SocialLinks({ profiles }: { profiles: SocialProfiles }) {
  const links = platforms.flatMap(({ key, label, domains, Icon }) => {
    const href = profiles[key];
    if (!href || !isProfileUrl(href, domains)) return [];
    return (
      <li key={key}>
        <a href={href} aria-label={label}>
          {Icon ? <Icon size={15} aria-hidden="true" /> : <span aria-hidden="true">𝕏</span>}
        </a>
      </li>
    );
  });

  return links.length ? <ul className="social-links">{links}</ul> : null;
}
