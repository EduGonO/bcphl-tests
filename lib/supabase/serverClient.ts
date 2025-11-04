import { createClient, SupabaseClient } from "@supabase/supabase-js";

const urlEnvKeys = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const;
const serviceEnvKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_API_KEY",
];

export type ServerSupabaseClient = SupabaseClient;

const firstEnvValue = (keys: readonly string[]): string | null => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return null;
};

export const getSupabaseServerClient = (): ServerSupabaseClient | null => {
  const url = firstEnvValue(urlEnvKeys);
  const key = firstEnvValue(serviceEnvKeys);

  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Supabase environment variables are not fully configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "bicephale-indices-server",
      },
    },
  });
};
