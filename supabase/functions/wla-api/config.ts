export const getDefaultEnv = () => {
  return Deno.env.get("DEFAULT_ENV")?.trim() || "demo";
};

export const getAllowedOrigins = () => {
  const origins = Deno.env.get("CORS_ORIGINS")?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : ["https://dyaroman.github.io"];
};
