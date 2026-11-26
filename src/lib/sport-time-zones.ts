export const japanTime = "Asia/Tokyo";
export const localTime = "local";

export const timeZoneRegions = {
  asia: [
    { id: "Asia/Tokyo", country: "JP", city: "Tokyo", type: "reference" },
  ],
  southAmerica: [
    { id: "America/Lima", country: "PE", city: "Lima" },
    { id: "America/Bogota", country: "CO", city: "Bogota" },
    { id: "America/Guayaquil", country: "EC", city: "Guayaquil" },
    { id: "Pacific/Galapagos", country: "EC", city: "Galapagos" },
    { id: "America/Santiago", country: "CL", city: "Santiago" },
    { id: "America/Punta_Arenas", country: "CL", city: "Punta_Arenas" },
    { id: "America/Coyhaique", country: "CL", city: "Coyhaique" },
    { id: "Pacific/Easter", country: "CL", city: "Easter" },
    { id: "America/Argentina/Buenos_Aires", country: "AR", city: "Buenos_Aires" },
    { id: "America/Sao_Paulo", country: "BR", city: "Sao_Paulo" },
    { id: "America/Manaus", country: "BR", city: "Manaus" },
    { id: "America/Rio_Branco", country: "BR", city: "Rio_Branco" },
    { id: "America/Noronha", country: "BR", city: "Noronha" },
    { id: "America/La_Paz", country: "BO", city: "La_Paz" },
    { id: "America/Caracas", country: "VE", city: "Caracas" },
    { id: "America/Asuncion", country: "PY", city: "Asuncion" },
    { id: "America/Montevideo", country: "UY", city: "Montevideo" },
  ],
  centralAmerica: [
    { id: "America/Panama", country: "PA", city: "Panama" },
    { id: "America/Costa_Rica", country: "CR", city: "Costa_Rica" },
    { id: "America/Guatemala", country: "GT", city: "Guatemala" },
    { id: "America/El_Salvador", country: "SV", city: "El_Salvador" },
    { id: "America/Tegucigalpa", country: "HN", city: "Tegucigalpa" },
    { id: "America/Managua", country: "NI", city: "Managua" },
    { id: "America/Santo_Domingo", country: "DO", city: "Santo_Domingo" },
    { id: "America/Havana", country: "CU", city: "Havana" },
    { id: "America/Puerto_Rico", country: "PR", city: "Puerto_Rico" },
  ],
  northAmerica: [
    { id: "America/Mexico_City", country: "MX", city: "Mexico_City", type: "central" },
    { id: "America/Cancun", country: "MX", city: "Cancun", type: "east" },
    { id: "America/Mazatlan", country: "MX", city: "Mazatlan", type: "pacific" },
    { id: "America/Hermosillo", country: "MX", city: "Hermosillo", type: "sonora" },
    { id: "America/Tijuana", country: "MX", city: "Tijuana", type: "baja" },
    { id: "America/Ciudad_Juarez", country: "MX", city: "Ciudad_Juarez", type: "mountain" },
    { id: "America/Matamoros", country: "MX", city: "Matamoros", type: "borderCentral" },
    { id: "America/New_York", country: "US", city: "New_York", type: "east" },
    { id: "America/Chicago", country: "US", city: "Chicago", type: "central" },
    { id: "America/Denver", country: "US", city: "Denver", type: "mountain" },
    { id: "America/Los_Angeles", country: "US", city: "Los_Angeles", type: "pacific" },
    { id: "America/Phoenix", country: "US", city: "Phoenix", type: "arizona" },
    { id: "America/Anchorage", country: "US", city: "Anchorage", type: "alaska" },
    { id: "Pacific/Honolulu", country: "US", city: "Honolulu", type: "hawaii" },
    { id: "America/St_Johns", country: "CA", city: "St_Johns", type: "newfoundland" },
    { id: "America/Halifax", country: "CA", city: "Halifax", type: "atlantic" },
    { id: "America/Toronto", country: "CA", city: "Toronto", type: "east" },
    { id: "America/Winnipeg", country: "CA", city: "Winnipeg", type: "central" },
    { id: "America/Regina", country: "CA", city: "Regina", type: "saskatchewan" },
    { id: "America/Edmonton", country: "CA", city: "Edmonton", type: "mountain" },
    { id: "America/Vancouver", country: "CA", city: "Vancouver", type: "pacific" },
    { id: "America/Whitehorse", country: "CA", city: "Whitehorse", type: "yukon" },
  ],
  europe: [
    { id: "Europe/Madrid", country: "ES", city: "Madrid" },
    { id: "Atlantic/Canary", country: "ES", city: "Canary" },
    { id: "Europe/London", country: "GB", city: "London" },
    { id: "Europe/Paris", country: "FR", city: "Paris" },
    { id: "Europe/Berlin", country: "DE", city: "Berlin" },
    { id: "Europe/Rome", country: "IT", city: "Rome" },
    { id: "Europe/Lisbon", country: "PT", city: "Lisbon" },
    { id: "Atlantic/Madeira", country: "PT", city: "Madeira" },
    { id: "Atlantic/Azores", country: "PT", city: "Azores" },
  ],
} as const;

const supportedZones = new Map<string, boolean>();
const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

export function isSupportedTimeZone(zone: string) {
  const cached = supportedZones.get(zone);
  if (cached !== undefined) return cached;
  let supported = false;
  try {
    if (zone && !/^[+-]/.test(zone)) {
      new Intl.DateTimeFormat("en", { timeZone: zone });
      supported = true;
    }
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
  }
  supportedZones.set(zone, supported);
  return supported;
}

export function utcOffsetAt(timeZone: string, instant: number) {
  let formatter = offsetFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "longOffset" });
    offsetFormatters.set(timeZone, formatter);
  }
  const offset = formatter.formatToParts(instant).find(({ type }) => type === "timeZoneName")?.value;
  return offset === "GMT" ? "UTC+00:00" : offset?.replace("GMT", "UTC") ?? "";
}
