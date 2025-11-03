import { createClient, SupabaseClient } from "@supabase/supabase-js";

const fallbackUrl = "https://suxbfvkamlanguqoanab.supabase.co";
const fallbackServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eGJmdmthbWxhbmd1cW9hbmFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAyMzQ3NywiZXhwIjoyMDc3NTk5NDc3fQ.8W9AYks6HDhDHOWXqV5hxvtokN4QEF4A3RBcYp2MzVI";

const urlEnvKeys = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"] as const;
const serviceEnvKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_API_KEY",
];

export type ServerSupabaseClient = SupabaseClient;

export const getSupabaseServerClient = (): ServerSupabaseClient | null => {
  const supabaseUrl = urlEnvKeys
    .map((key) => process.env[key])
    .find((value): value is string => Boolean(value));

  const supabaseServiceKey = serviceEnvKeys
    .map((key) => process.env[key])
    .find((value): value is string => Boolean(value));

  const url = supabaseUrl ?? fallbackUrl;
  const key = supabaseServiceKey ?? fallbackServiceKey;

  if (!url || !key) {
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
