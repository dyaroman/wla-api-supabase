export const getDefaultEnv = () => {
  return Deno.env.get("DEFAULT_ENV")?.trim() || "demo";
};

export const getAllowedOrigins = () => {
  const origins = Deno.env.get("CORS_ORIGINS")?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : ["https://dyaroman.github.io"];
};

// Returns current time in Kyiv timezone matching the fallback JSON format:
// "HH:MM:SS Month DD, YYYY" e.g. "15:20:55 May 27, 2026".
// Computed on every request — never stored.
export const getKyivTimestamp = (): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}:${get("second")} ${get("month")} ${get("day")}, ${get("year")}`;
};
