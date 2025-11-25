import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerClient } from "../../../lib/supabase/serverClient";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb",
    },
  },
};

const allowedTypes = new Set(["image/png", "image/jpeg"]);
const allowedExtensions = new Set(["png", "jpg", "jpeg"]);

const toBase64Buffer = (input: string): Buffer => {
  const trimmed = input.includes(",") ? input.split(",").pop() || "" : input;
  return Buffer.from(trimmed, "base64");
};

const sanitizeSlug = (value?: string | null): string => {
  if (!value) return "article";
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim() || "article";
};

const sanitizeFileName = (name?: string | null): string => {
  if (!name) return "image.jpg";
  const parts = name.split(".");
  const ext = parts.pop()?.toLowerCase() ?? "";
  const base = parts.join(".") || "image";
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-{2,}/g, "-");
  const safeExt = allowedExtensions.has(ext) ? ext : "jpg";
  return `${safeBase}.${safeExt}`;
};

const buildStoragePath = (
  slug: string,
  fileName: string,
  articleId?: string | null
): string => {
  const prefix = articleId ? `articles/${articleId}` : `articles/${slug}`;
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${fileName}`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Méthode non autorisée");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({
      error: "Configuration Supabase manquante : définissez SUPABASE_URL et SUPABASE_KEY.",
    });
  }

  try {
    const { articleId, slug, fileName, fileType, data } = req.body as Record<string, any>;

    if (!fileName || !fileType || !data) {
      return res.status(400).json({ error: "Paramètres de fichier manquants." });
    }

    if (!allowedTypes.has(fileType)) {
      return res.status(400).json({ error: "Formats autorisés : PNG ou JPEG." });
    }

    const safeSlug = sanitizeSlug(slug);
    const safeName = sanitizeFileName(fileName);
    const storagePath = buildStoragePath(safeSlug, safeName, articleId);
    const buffer = toBase64Buffer(data);

    const { error: uploadErr } = await supabase.storage
      .from("article-media")
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    const { data: publicData } = supabase.storage
      .from("article-media")
      .getPublicUrl(storagePath);

    return res.status(200).json({
      storagePath,
      publicUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error("upload-image", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Téléversement impossible.",
    });
  }
};

export default handler;

