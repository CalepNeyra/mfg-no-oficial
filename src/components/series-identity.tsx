import { useTranslations } from "next-intl";
import type { Division } from "@/lib/competition";
import { seriesData } from "@/lib/series";
import "./series-identity.css";

export function SeriesIdentity({ division, as: Heading = "h1" }: { division: Division; as?: "h1" | "h3" | "p" }) {
  const t = useTranslations("divisions");
  return (
    <div className="series-identity">
      <span className="series-identity-mark" aria-hidden="true">
        <strong>MFG</strong><span>DIV. {seriesData[division].number}</span>
      </span>
      <Heading id={Heading === "h1" ? "series-title" : undefined}><span className="sr-only">MFG </span>{t(`${division}.title`)}</Heading>
    </div>
  );
}
