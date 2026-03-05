import { getSupabaseServerClient } from "./serverClient";
import {
  formatSupabaseError,
  loadSupabaseBios,
  loadSupabaseCategorySummaries,
} from "./content";
import type { SupabaseBioEntry, SupabaseCategorySummary } from "../../types/supabase";

export type WorkspaceData = {
  supabaseCats: SupabaseCategorySummary[];
  supabaseBios: SupabaseBioEntry[];
  supabaseError: string | null;
};

export const resolveWorkspaceData = async (): Promise<WorkspaceData> => {
  let supabaseCats: SupabaseCategorySummary[] = [];
  let supabaseBios: SupabaseBioEntry[] = [];
  let supabaseError: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      supabaseError =
        "Configurer les variables d'environnement nécessaires pour activer la synchronisation des articles.";
    } else {
      supabaseCats = await loadSupabaseCategorySummaries(supabase);
      supabaseBios = await loadSupabaseBios(supabase);
    }
  } catch (error) {
    supabaseError = formatSupabaseError(error);
  }

  return { supabaseCats, supabaseBios, supabaseError };
};
