// /lib/articleService.ts
import fs from 'fs';
import path from 'path';
import { Article, Category } from '../types';

export function getArticleData(): { articles: Article[]; categories: Category[] } {
  const textsDir = path.join(process.cwd(), 'texts');
  const articles: Article[] = [];
  
  // Read folders inside /texts
  const categoryFolders = fs
    .readdirSync(textsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Create a default category for each folder
  const categories: Category[] = categoryFolders.map((cat) => ({
    name: cat,
    color: '#607d8b', // default color
  }));

  // Parse each markdown file in every category folder
  for (const cat of categoryFolders) {
    const catPath = path.join(textsDir, cat);
    fs.readdirSync(catPath).forEach((file) => {
      if (file.endsWith('.md')) {
        const filePath = path.join(catPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf-8').trim();
        const lines = fileContents.split('\n').map((line) => line.trim());
        const slug = file.replace('.md', '');
        const title = lines[0]?.startsWith('#') ? lines[0].replace(/^#+\s*/, '') : slug;
        const date = lines[1] || 'Unknown Date';
        const author = lines[2] || 'Unknown Author';
        const preview = lines.slice(3).join(' ').slice(0, 80) + '...';
        articles.push({ title, slug, category: cat, date, author, preview });
      }
    });
  }

  return { articles, categories };
}
