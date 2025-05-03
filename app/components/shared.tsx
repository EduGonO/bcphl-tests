// /app/components/shared.tsx
import React from 'react';
import Header, { Category } from './Header';
import Footer from './Footer';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';

interface SharedCategoryPageProps {
  category: string;
  articles: Article[];
}

export default function SharedCategoryPage({ category, articles }: SharedCategoryPageProps) {
  const config = categoryConfigMap[category];
  
  if (!config) {
    return <div>Catégorie (shared) introuvable.</div>;
  }

  return (
    <div>
      <div className="category-page" style={{ padding: '2rem', background: '#fafafa' }}>
        <h1 style={{ color: config.color }}>{category}</h1>
        
        {config.media.length > 0 && (
          <div className="category-media" style={{ marginBottom: '2rem' }}>
            {config.media.map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt={`${category} media ${i}`} 
                style={{ width: '100%', marginBottom: '1rem' }} 
              />
            ))}
          </div>
        )}
        
        {config.dataFolder && (
          <div className="category-info">
            <p className="source-info">
              Source: {config.dataFolder}
            </p>
          </div>
        )}
        
        <div className="article-list">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article.slug} className="article-item" style={{ marginBottom: '1.5rem' }}>
                <h3>{article.title}</h3>
                <h4>design example v0 - Apr29, liens + structure</h4>
                <div className="article-meta">{article.date} · {article.author}</div>
                <p className="article-preview">{article.preview}</p>
              </div>
            ))
          ) : (
            <p>Aucun article trouvé dans cette catégorie.</p>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .category-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .article-item {
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        
        .article-meta {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .source-info {
          font-style: italic;
          color: #777;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}