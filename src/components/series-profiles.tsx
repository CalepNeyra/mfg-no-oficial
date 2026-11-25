import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Division } from "@/lib/competition";
import { sections } from "@/lib/portal";
import { driverHref, publicDrivers } from "@/lib/public-information";
import { EmptyState, MediaSlot } from "./portal-ui";

export function SeriesProfiles({ division }: { division: Division }) {
  const t = useTranslations("sections.drivers");
  const records = publicDrivers().filter((driver) => driver.division === division).slice(0, 3);
  if (!records.length) return <EmptyState icon={sections.drivers.icon}>{t("empty")}</EmptyState>;

  return <ul className="series-profiles">
    {records.map((driver) => <li key={driver.slug}>
      {driver.photograph && <MediaSlot variant="editorial" image={driver.photograph} />}
      <div>
        <Link className="text-link" href={driverHref(driver.slug)}>{driver.name}</Link>
        <p>#{driver.number}{driver.manufacturer || driver.model ? " · " + [driver.manufacturer, driver.model].filter(Boolean).join(" ") : ""}</p>
      </div>
    </li>)}
  </ul>;
}
