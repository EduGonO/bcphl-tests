// /pages/categories/[category].tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getArticleData } from '../lib/articleService';
import { categoryConfigMap } from '../config/categoryColors';
import SharedCategoryPage from '../app/components/shared';
import { Article } from '../types'; // Ensure you import your Article type
import Header, { Category } from '../app/components/Header';




interface CategoryEntryProps {
  category: string;
  articles: Article[];
}

export default function CategoryEntry({ category, articles }: CategoryEntryProps) {
  const config = categoryConfigMap[category];

  if (!config) return <div>Catégorie introuvable.</div>;

  const usesSharedPage = ['Love Letters', 'Bascule', 'Sensure', 'Banque des rêves', 'Cartographie'].includes(category);

  if (usesSharedPage) {
    return <SharedCategoryPage category={category} articles={articles} />;
  }
  
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const handleCategoryChange = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setFilteredArticles(articles);
      setBackgroundColor('#ffffff');
    } else {
      setActiveCategory(category);
      setFilteredArticles(articles.filter((a) => a.category === category));
      setBackgroundColor('#ffffff');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: config.color }}>{category}</h1>
      {config.media.map((src, i) => (
        <img key={i} src={src} alt={`Media ${i}`} style={{ maxWidth: '100%', marginBottom: '1rem' }} />
      ))}
      <ul>
        {articles.map((a) => (
          <li key={a.slug}>
            <strong>{a.title}</strong> -Evenements- {a.date} by {a.author}
            <p>{a.preview}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
