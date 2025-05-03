// /pages/categories/image-critique.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header';
import Footer from '../../app/components/Footer';

interface SensurePageProps {
  articles: Article[];
  categories: Category[];
}

export default function ImageCritiquePage({ articles, categories }: SensurePageProps) {
  const categoryName = 'Sensure';
  const config = categoryConfigMap[categoryName];

  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  return (
    <div>
      <Header categories={categories} />
      <main className="image-critique-page">
        <div className="header-banner" style={{ backgroundColor: config.color }}>
          <h1>{categoryName}</h1>
          <p>Sensure</p>
        </div>

        {config.media.length > 0 && (
          <div className="media-showcase">
            {config.media.map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt={`${categoryName} media ${i}`} 
                className="media-item" 
              />
            ))}
          </div>
        )}

        <div className="article-grid">
          {articles.map((article) => (
            <div key={article.slug} className="article-card">
              <h3>{article.title}</h3>
              <div className="article-meta">{article.date} · {article.author}</div>
              <p className="article-preview">{article.preview}</p>
              <a href={`/articles/${article.slug}`} className="read-more">
                Lire la suite
              </a>
            </div>
          ))}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .image-critique-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .header-banner {
          text-align: center;
          padding: 3rem 1rem;
          color: white;
          margin-bottom: 2rem;
        }
        
        .media-showcase {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem 0;
        }
        
        .media-item {
          max-width: 300px;
          height: auto;
          object-fit: cover;
        }
        
        .article-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .article-card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 1.5rem;
          transition: transform 0.2s ease;
        }
        
        .article-card:hover {
          transform: translateY(-5px);
        }
        
        .article-meta {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .read-more {
          display: inline-block;
          margin-top: 1rem;
          color: ${config.color};
          font-weight: bold;
          text-decoration: none;
        }
        
        .read-more:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { articles, categories } = getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Sensure');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};