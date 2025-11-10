import fs from "fs";
import path from "path";
import { Article } from "../types";
import {
  categoryConfigMap,
  defaultCategoryColor,
} from "../config/categoryColors";

const LEGACY_TEXTS_DIR = path.join(process.cwd(), "texts");
const NEW_TEXTS_DIR = path.join(process.cwd(), "textes");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;

const PUBLIC_LEGACY_BASE = "/texts";
const PUBLIC_NEW_BASE = "/textes";

type SourceType = "legacy" | "flat";

export type ArticleRecord = {
  article: Article;
  body: string;
  yaml: Record<string, any>;
  absolutePath: string;
  publicBasePath: string;
  sourceType: SourceType;
};

type ArticleCollection = {
  records: ArticleRecord[];
  categoryColors: Map<string, string>;
};

let cachedCollection: ArticleCollection | null = null;

const ensureString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const normalizeMedia = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

const registerCategory = (
  categoryColors: Map<string, string>,
  categoryName: string
) => {
  if (!categoryColors.has(categoryName)) {
    const config = categoryConfigMap[categoryName];
    categoryColors.set(
      categoryName,
      config?.color || defaultCategoryColor
    );
  }
};

const readYaml = (block: string): Record<string, any> => {
  const obj: Record<string, any> = {};
  block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [rawKey, ...rawValue] = line.split(":");
      if (!rawKey || rawValue.length === 0) {
        return;
      }
      const key = rawKey.trim();
      const joined = rawValue.join(":").trim();
      obj[key] =
        joined.startsWith("[") && joined.endsWith("]")
          ? joined
              .slice(1, -1)
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
          : joined;
    });
  return obj;
};

const loadMarkdown = (filePath: string): { yaml: Record<string, any>; body: string } => {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const yamlBlock = raw.slice(3, end).trim();
      const body = raw.slice(end + 4).trim();
      return { yaml: readYaml(yamlBlock), body };
    }
  }
  return { yaml: {}, body: raw };
};

const slugify = (value: string): string => {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return base || "article";
};

const createPreview = (body: string): string => {
  const cleaned = body
    .replace(/^#{1,6}\s.*?\n+/, "")
    .replace(/^\s*!\[[^\]]*]\([^)]+\)\s*$/gm, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  if (!cleaned) {
    return "";
  }

  const min = 180;
  const max = 260;
  const slice = cleaned.slice(min, max);
  const relEnd = slice.search(/[.!?](?:\s|\n)/);
  const cut = relEnd !== -1 ? min + relEnd + 1 : Math.min(cleaned.length, 200);
  let preview = cleaned.slice(0, cut).trim();
  if (relEnd === -1 && cut < cleaned.length) {
    preview += "…";
  }
  return preview;
};

const buildArticleRecord = (
  categoryColors: Map<string, string>,
  category: string,
  slug: string,
  filePath: string,
  publicBasePath: string,
  sourceType: SourceType,
  yaml: Record<string, any>,
  body: string,
  mediaFromDir: string[] = []
): ArticleRecord => {
  registerCategory(categoryColors, category);

  const titleCandidate = ensureString(yaml.title);
  const title =
    titleCandidate ||
    (body.startsWith("#")
      ? body.split("\n")[0].replace(/^#+\s*/, "").trim()
      : slug);

  const date = ensureString(yaml.date) || "Unknown Date";
  const author = ensureString(yaml.author) || "Unknown Author";
  const headerImage = ensureString(yaml["header-image"] || yaml.headerImage);
  const yamlMedia = normalizeMedia(yaml.media);
  const media = Array.from(new Set([...yamlMedia, ...mediaFromDir]));

  const preview = createPreview(body);
  const normalizedDate = date && date !== "Unknown Date" ? date : "";

  const article: Article = {
    id: slug,
    title,
    slug,
    category,
    categoryName: category,
    date,
    author,
    preview,
    media,
    headerImage,
    excerpt: null,
    publishedAt: normalizedDate || null,
    authoredDate: normalizedDate || null,
    updatedAt: null,
  };

  return {
    article,
    body,
    yaml,
    absolutePath: filePath,
    publicBasePath,
    sourceType,
  };
};

const collectLegacyArticles = (
  categoryColors: Map<string, string>
): ArticleRecord[] => {
  if (!fs.existsSync(LEGACY_TEXTS_DIR)) {
    return [];
  }

  const records: ArticleRecord[] = [];
  const categories = fs
    .readdirSync(LEGACY_TEXTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const category of categories) {
    const categoryDir = path.join(LEGACY_TEXTS_DIR, category);
    const articleDirs = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const slugDir of articleDirs) {
      const articleDir = path.join(categoryDir, slugDir);
      const mdFiles = fs.readdirSync(articleDir).filter((file) => file.endsWith(".md"));
      if (mdFiles.length === 0) {
        continue;
      }

      const preferred = mdFiles.find((file) => file === `${slugDir}.md`) ?? mdFiles[0];
      const absolutePath = path.join(articleDir, preferred);
      const { yaml, body } = loadMarkdown(absolutePath);

      const imageList = fs
        .readdirSync(articleDir)
        .filter((file) => IMAGE_EXT.test(file))
        .map((file) =>
          path.posix.join(PUBLIC_LEGACY_BASE, category, slugDir, file)
        );

      records.push(
        buildArticleRecord(
          categoryColors,
          category,
          slugDir,
          absolutePath,
          path.posix.join(PUBLIC_LEGACY_BASE, category, slugDir),
          "legacy",
          yaml,
          body,
          imageList
        )
      );
    }
  }

  return records;
};

const collectFlatArticles = (
  categoryColors: Map<string, string>
): ArticleRecord[] => {
  if (!fs.existsSync(NEW_TEXTS_DIR)) {
    return [];
  }

  const records: ArticleRecord[] = [];
  const categories = fs
    .readdirSync(NEW_TEXTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const category of categories) {
    const categoryDir = path.join(NEW_TEXTS_DIR, category);
    const dirEntries = fs.readdirSync(categoryDir, { withFileTypes: true });
    const markdownFiles = dirEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name);

    const existingSlugs = new Set<string>();

    for (const fileName of markdownFiles) {
      const absolutePath = path.join(categoryDir, fileName);
      const { yaml, body } = loadMarkdown(absolutePath);
      const baseName = fileName.replace(/\.md$/, "");
      const frontMatterSlug = ensureString(yaml.slug);
      let slugCandidate = frontMatterSlug
        ? slugify(frontMatterSlug)
        : slugify(baseName);

      let finalSlug = slugCandidate;
      let counter = 2;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${slugCandidate}-${counter}`;
        counter += 1;
      }
      existingSlugs.add(finalSlug);

      records.push(
        buildArticleRecord(
          categoryColors,
          category,
          finalSlug,
          absolutePath,
          path.posix.join(PUBLIC_NEW_BASE, category),
          "flat",
          yaml,
          body
        )
      );
    }
  }

  return records;
};

const ensureCollection = (): ArticleCollection => {
  if (cachedCollection) {
    return cachedCollection;
  }

  const categoryColors = new Map<string, string>();
  const records = [
    ...collectLegacyArticles(categoryColors),
    ...collectFlatArticles(categoryColors),
  ];

  cachedCollection = { records, categoryColors };
  return cachedCollection;
};

export const getArticleRecords = (): ArticleRecord[] => ensureCollection().records;

export const findArticleRecord = (
  category: string,
  slug: string
): ArticleRecord | undefined => {
  const normalizedCategory = category.toLowerCase();
  const normalizedSlug = slug.toLowerCase();
  return getArticleRecords().find(
    (record) =>
      record.article.category.toLowerCase() === normalizedCategory &&
      record.article.slug.toLowerCase() === normalizedSlug
  );
};

export function getArticleData(): {
  articles: Article[];
  categories: { name: string; color: string }[];
} {
  const { records, categoryColors } = ensureCollection();
  const articles = records.map((record) => record.article);
  const categories = Array.from(categoryColors.entries()).map(([name, color]) => ({
    name,
    color,
  }));

  return { articles, categories };
}

export const clearArticleCache = () => {
  cachedCollection = null;
};
