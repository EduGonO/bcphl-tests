// /lib/articleService.ts
import fs from "fs";
import path from "path";
import { Article } from "../types";
import {
  categoryConfigMap,
  defaultCategoryColor,
} from "../config/categoryColors";

const TEXTS_DIR = path.join(process.cwd(), "texts");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;

// ── helpers ──────────────────────────────────────────────────────────
function readYaml(block: string): Record<string, any> {
  // simple "key: value" parser, arrays like [a,b,c] → ['a','b','c']
  const obj: Record<string, any> = {};
  block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [k, ...v] = line.split(":");
      if (k && v.length) {
        const raw = v.join(":").trim();
        obj[k.trim()] =
          raw.startsWith("[") && raw.endsWith("]")
            ? raw
                .slice(1, -1)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : raw;
      }
    });
  return obj;
}

function loadMd(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const yaml = readYaml(raw.slice(3, end).trim());
      const body = raw.slice(end + 4).trim();
      return { yaml, body };
    }
  }
  return { yaml: {}, body: raw };
}

// ── main ─────────────────────────────────────────────────────────────
export function getArticleData(): {
  articles: Article[];
  categories: { name: string; color: string }[];
} {
  const articles: Article[] = [];

  // categories = immediate folders in /texts
  const categoryFolders = fs
    .readdirSync(TEXTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  // collect category colour map
  const categories = categoryFolders.map((cat) => ({
    name: cat,
    color: categoryConfigMap[cat]?.color || defaultCategoryColor,
  }));

  // iterate each category → each article sub-folder
  for (const cat of categoryFolders) {
    const catDir = path.join(TEXTS_DIR, cat);
    const articleDirs = fs
      .readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    articleDirs.forEach((slug) => {
      const artDir = path.join(catDir, slug);
      const mdPath = path.join(artDir, `${slug}.md`);
      if (!fs.existsSync(mdPath)) return; // skip if file missing

      const { yaml, body } = loadMd(mdPath);

      // fall-backs
      const title =
        yaml.title ||
        (body.startsWith("#")
          ? body.split("\n")[0].replace(/^#+\s*/, "")
          : slug);
      const date = yaml.date || "Unknown Date";
      const author = yaml.author || "Unknown Author";
      const headerImage = yaml["header-image"] || "";

      // preview = first 180 chars of body after heading
      const preview = body.replace(/^#.*?\n/, "").slice(0, 180) + "...";

      // media list: YAML array union physical images in folder
      const yamlMedia = Array.isArray(yaml.media) ? yaml.media : [];
      const dirImages = fs
        .readdirSync(artDir)
        .filter((f) => IMAGE_EXT.test(f))
        .map((f) => path.join("/texts", cat, slug, f)); // public path hint

      const media = [...new Set([...yamlMedia, ...dirImages])];

      articles.push({
        title,
        slug,
        category: cat,
        date,
        author,
        preview,
        media,
        headerImage,
      });
    });
  }

  return { articles, categories };
}


/*
// /pages/index.tsx (or in /lib/articleService.ts)
import fs from 'fs';
import path from 'path';
import { Article } from '../types';
import { defaultCategoryColor, categoryConfigMap } from '../config/categoryColors';

export function getArticleData(): { articles: Article[]; categories: { name: string; color: string }[] } {
  const textsDir = path.join(process.cwd(), 'texts');
  const articles: Article[] = [];
  
  // Read all directories (categories) inside /texts
  const categoryFolders = fs.readdirSync(textsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  
  // Build the categories array using our mapping.
  const categories = categoryFolders.map((cat) => {
  const config = categoryConfigMap[cat];
  return {
    name: cat,
    color: config?.color || defaultCategoryColor,
  };
});

  // Loop over each category folder and read markdown files.
  for (const cat of categoryFolders) {
    const catPath = path.join(textsDir, cat);
    fs.readdirSync(catPath).forEach((file: string) => {
      if (file.endsWith('.md')) {
        const filePath = path.join(catPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf-8').trim();
        const lines = fileContents.split('\n').map((l: string) => l.trim());
        const slug = file.replace('.md', '');
        const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*)/, '') : slug;
        const date = lines[1] || 'Unknown Date';
        const author = lines[2] || 'Unknown Author';
        const preview = lines.slice(3).join(' ').slice(0, 180) + '...';
        articles.push({ title, slug, category: cat, date, author, preview });
      }
    });
  }
  return { articles, categories };
}
*/