import { loadSupabaseIntroEntries } from "./supabase/content";
import { getSupabaseServerClient } from "./supabase/serverClient";

const INTRO_TITLE_BY_SLUG = {
  creation: "Intro-Creation",
  reflexion: "Intro-Reflexion",
  irl: "Intro-IRL",
} as const;

export type IntroSlug = keyof typeof INTRO_TITLE_BY_SLUG;

export type IntroContent = {
  html: string | null;
  markdown: string;
};

const ensureSupabaseClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error("Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY.");
  }
  return client;
};

export const getIntroContentFor = async (
  slug: IntroSlug
): Promise<IntroContent | null> => {
  const supabase = ensureSupabaseClient();
  const entries = await loadSupabaseIntroEntries(supabase);
  const title = INTRO_TITLE_BY_SLUG[slug];

  const entry = entries.find((item) => item.title === title);
  if (!entry) {
    return null;
  }

  return {
    html: entry.bodyHtml,
    markdown: entry.bodyMarkdown,
  };
};
