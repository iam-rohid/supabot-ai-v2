export const APP_NAME = "SupaBot AI";

export const LOCALHOST = "localhost:3000";
export const DOMAIN = "supabotai.com";
export const EMAIL_DOMAIN = "supabotai.com";
export const GITHUB_REPO = "https://github.com/iam-rohid/supabot-ai";

export const BASE_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://${DOMAIN}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : `http://${LOCALHOST}`;

export const CHATBOT_WIDGET_SCRIPT_URL = `${BASE_URL}/chatbot-widget.js`;

export const RESURVED_APP_PATH_KEYS = new Set(["signin", "settings", "new"]);

export const AUTH_PATHNAMES = new Set(["/signin"]);

export const OPENAI_EMBEDDING_DIMENSIONS = 1536;

export const ALLOWED_EMAILS = ["rohidul209@gmail.com"];
