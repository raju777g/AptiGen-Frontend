import axios from "axios";

// In production, use the backend origin directly so the OAuth callback and
// subsequent API requests share the same JSESSIONID cookie. Local development
// keeps using the Vite proxy when no API URL is configured.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
export const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_BASE_URL
  || (API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : "");

 export const api = axios.create({
   baseURL: API_BASE,
   withCredentials: true, // sends the session cookie with every request

   headers: {
    'ngrok-skip-browser-warning': 'true', // to skip ngrok's warning
   },
 });

// const host = window.location.hostname;
// export const api = axios.create({
//   baseURL: `http://${host}:8080/api`,
//   withCredentials: true,
// });

