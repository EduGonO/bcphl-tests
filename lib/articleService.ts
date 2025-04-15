// /pages/index.tsx (or in /lib/articleService.ts)
import fs from 'fs';
import path from 'path';
import { Article } from '../types';
import { defaultCategoryColor, categoryColorMap } from '../config/categoryColors';

export function getArticleData(): { articles: Article[]; categories: { name: string; color: string }[] } {
  const textsDir = path.join(process.cwd(), 'texts');
  const articles: Article[] = [];
  
  // Read all directories (categories) inside /texts
  const categoryFolders = fs.readdirSync(textsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  
  // Build the categories array using our mapping.
  const categories = categoryFolders.map((cat) => ({
    name: cat,
    color: categoryColorMap[cat] || defaultCategoryColor, 
  }));

  // Loop over each category folder and read markdown files.
  for (const cat of categoryFolders) {
    const catPath = path.join(textsDir, cat);
    fs.readdirSync(catPath).forEach((file: string) => {
      if (file.endsWith('.md')) {
        const filePath = path.join(catPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf-8').trim();
        const lines = fileContents.split('\n').map((l: string) => l.trim());
        const slug = file.replace('.md', '');
        const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*/, '') : slug;
        const date = lines[1] || 'Unknown Date';
        const author = lines[2] || 'Unknown Author';
        const preview = lines.slice(3).join(' ').slice(0, 80) + '...';
        articles.push({ title, slug, category: cat, date, author, preview });
      }
    });
  }
  return { articles, categories };
}
