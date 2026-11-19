// Centralized API configuration for local and cloud deployment (Vercel)
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
