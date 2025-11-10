import { getSupabaseServerClient } from "./serverClient";
import { formatSupabaseError, loadSupabaseCategorySummaries } from "./content";
import type { SupabaseCategorySummary } from "../../types/supabase";

export type WorkspaceData = {
  supabaseCats: SupabaseCategorySummary[];
  supabaseError: string | null;
};

export const resolveWorkspaceData = async (): Promise<WorkspaceData> => {
  let supabaseCats: SupabaseCategorySummary[] = [];
  let supabaseError: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      supabaseError =
        "Configurer les variables d'environnement nécessaires pour activer la synchronisation des articles.";
    } else {
      supabaseCats = await loadSupabaseCategorySummaries(supabase);
    }
  } catch (error) {
    supabaseError = formatSupabaseError(error);
  }

  return { supabaseCats, supabaseError };
};
