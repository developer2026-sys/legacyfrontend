const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
const productionApiBase = "https://legacybackend.vercel.app/api";

export const BASE_URL = configuredApiBase || (
  import.meta.env.DEV ? "https://legacybackend.vercel.app/api" : productionApiBase
);
