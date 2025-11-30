export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

export const apiUrl = (path: string) => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
};

export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(apiUrl(path), init);
};

export default apiFetch;
