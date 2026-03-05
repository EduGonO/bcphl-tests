import type { NextApiRequest, NextApiResponse } from "next";
import { formatSupabaseError, loadSupabaseBios } from "../../../lib/supabase/content";
import { getSupabaseServerClient } from "../../../lib/supabase/serverClient";
import type { SupabaseBioEntry } from "../../../types/supabase";

type BiosResponse = { entries: SupabaseBioEntry[] } | { error: string };

const ensureClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error("Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY.");
  }
  return client;
};

const parsePayload = (req: NextApiRequest) => {
  const body = req.body ?? {};
  const id = body.id ? String(body.id) : "";
  const slug = body.slug ? String(body.slug).trim() : "";
  const name = body.name ? String(body.name).trim() : "";
  const role = body.role ? String(body.role).trim() : "";
  const portraitBase = body.portraitBase ? String(body.portraitBase).trim() : "";
  const rank = Number(body.rank);
  const bio = Array.isArray(body.bio)
    ? body.bio.filter((entry: unknown) => typeof entry === "string").map(String)
    : [];

  return {
    id,
    slug,
    name,
    role,
    portraitBase,
    rank,
    bio,
  };
};

const handleGet = async (res: NextApiResponse<BiosResponse>) => {
  try {
    const supabase = ensureClient();
    const entries = await loadSupabaseBios(supabase);
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handlePut = async (req: NextApiRequest, res: NextApiResponse<BiosResponse>) => {
  const payload = parsePayload(req);

  if (!payload.id) {
    return res.status(400).json({ error: "Identifiant de bio manquant." });
  }

  if (!payload.slug || !payload.name) {
    return res.status(400).json({ error: "Slug et nom sont obligatoires." });
  }

  if (!Number.isFinite(payload.rank)) {
    return res.status(400).json({ error: "Le rang est invalide." });
  }

  try {
    const supabase = ensureClient();
    const { error } = await supabase
      .from("bicephale_bios")
      .update({
        slug: payload.slug,
        name: payload.name,
        role: payload.role || null,
        portrait_base: payload.portraitBase || null,
        rank: payload.rank,
        bio: payload.bio,
      })
      .eq("id", payload.id);

    if (error) {
      return res.status(400).json({ error: formatSupabaseError(error) });
    }

    const entries = await loadSupabaseBios(supabase);
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<BiosResponse>) => {
  if (req.method === "GET") {
    return handleGet(res);
  }

  if (req.method === "PUT") {
    return handlePut(req, res);
  }

  res.setHeader("Allow", "GET,PUT");
  return res.status(405).end("Méthode non autorisée");
};

export default handler;
