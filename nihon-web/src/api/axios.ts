import axios from "axios";
import { clearSession, getToken } from "../lib/authStorage";

/** The API's address: VITE_API_URL at build time (nihon-web/.env), or the local API during development. */
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A session revoked elsewhere ("log out everywhere", a password change or reset) signs this browser out too.
api.interceptors.response.use(undefined, error => {
  const response = (error as { response?: { status?: number; data?: { code?: string } } }).response;
  if (response?.status === 401 && response.data?.code === "session_expired" && getToken()) {
    clearSession();
    if (window.location.pathname !== "/login") window.location.assign("/login?expired=1");
  }
  return Promise.reject(error);
});

export default api;
