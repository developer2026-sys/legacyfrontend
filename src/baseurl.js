const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
const productionApiBase = "https://legacybackend.vercel.app/api";
// const productionApiBase = "http://localhost:5000/api";

export const BASE_URL = configuredApiBase || (
  import.meta.env.DEV ? "https://legacybackend.vercel.app/api" : productionApiBase
);


// export const BASE_URL = configuredApiBase || (
//   import.meta.env.DEV ? "http://localhost:5000/api" : productionApiBase
// );
