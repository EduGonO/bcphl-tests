import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
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
