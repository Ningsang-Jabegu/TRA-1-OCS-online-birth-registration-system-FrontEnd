// Determine runtime host (browser) to switch API base between localhost and production backend
const RUNTIME_HOST = typeof window !== "undefined" ? window.location.hostname : "";
const LOCAL_FALLBACK = "http://localhost:5000";
const PROD_FALLBACK = "https://obr-backend.ningsangjabegu.com.np";

// If VITE_API_BASE is set, prefer it; otherwise pick default based on whether
// frontend is running on localhost (development) or on a remote host (production).
const envApiBase = import.meta.env.VITE_API_BASE;
export const API_BASE = (() => {
  if (RUNTIME_HOST === "localhost" || RUNTIME_HOST === "127.0.0.1") {
    return envApiBase ?? LOCAL_FALLBACK;
  }
  // Not running locally — use provided environment override or the production backend domain
  return envApiBase ?? PROD_FALLBACK;
})();

export const apiUrl = (path: string) => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
};

export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(apiUrl(path), init);
};

export default apiFetch;
