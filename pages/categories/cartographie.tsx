// /pages/categories/image-critique.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header-2';
import Footer from '../../app/components/Footer';

interface ImageCritiquePageProps {
  articles: Article[];
  categories: Category[];
}

export default function ImageCritiquePage({ articles, categories }: ImageCritiquePageProps) {
  const categoryName = 'Cartographie';
  const config = categoryConfigMap[categoryName];
  const color = config?.color || '#000000';
  
  // Create header images mapping (this would normally come from props or a service)
  const headerImages: Record<string, string> = {};
  // Populate with any available header images for articles
  articles.forEach(article => {
    if (article.headerImage) {
      headerImages[article.slug] = article.headerImage;
    }
  });

  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  // Generate a randomized grid layout for each article
  const getGridArea = (index: number) => {
    const patterns = [
      "1 / 1 / 2 / 3", // wide top
      "1 / 3 / 3 / 4", // tall right
      "2 / 1 / 3 / 2", // small bottom left
      "2 / 2 / 3 / 3", // small bottom middle
      "3 / 1 / 5 / 3", // wide bottom
      "3 / 3 / 5 / 4", // tall bottom right
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="page-container" style={{ '--c': color } as React.CSSProperties}>
      <Header categories={categories} />
      <main className="image-critique-page">
        <div className="header-banner" style={{ borderColor: color }}>
          <div className="header-left-block" style={{ backgroundColor: `${color}60` }}></div>
          <div className="header-content">
            <h1 className="category-title">{categoryName}</h1>
            <p className="category-description">(Cartographie des Lieux)</p>
          </div>
          <div className="header-right-block" style={{ backgroundColor: color }}></div>
        </div>

        {config.media.length > 0 && (
          <div className="media-showcase">
            {config.media.map((src, i) => (
              <div 
                key={i}
                className={`media-item media-item-${i % 3}`}
                style={{ 
                  backgroundImage: `url(${src})`,
                  borderColor: color
                }}
              >
                <div className="media-overlay" style={{ backgroundColor: `${color}20` }}></div>
              </div>
            ))}
          </div>
        )}

        <div className="brutalist-divider">
          <div className="divider-line" style={{ backgroundColor: color }}></div>
          <div className="divider-square" style={{ borderColor: color }}></div>
          <div className="divider-circle" style={{ backgroundColor: color }}></div>
          <div className="divider-line" style={{ backgroundColor: color }}></div>
        </div>

        <div className="article-grid">
          {articles.map((article, index) => {
            const imgStyle = headerImages[article.slug] 
              ? { backgroundImage: `url(${headerImages[article.slug]})` } 
              : { backgroundColor: `${color}20` };
            
            return (
              <div 
                key={article.slug} 
                className="article-card"
                style={{ 
                  gridArea: index < 6 ? getGridArea(index) : 'auto',
                  borderColor: color
                }}
              >
                <div className="article-image" style={imgStyle}>
                  <div className="article-number">{(index + 1).toString().padStart(2, '0')}</div>
                </div>
                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  <div className="article-meta">
                    <span className="article-date">{article.date}</span>
                    <span className="article-separator" style={{ backgroundColor: color }}></span>
                    <span className="article-author">{article.author}</span>
                  </div>
                  <p className="article-preview">{article.preview}</p>
                  <a 
                    href={`/${categoryName}/${article.slug}`} 
                    className="read-more"
                    style={{ color }}
                  >
                    <span className="read-more-text">Lire la suite</span>
                    <span className="read-more-line" style={{ backgroundColor: color }}></span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .page-container {
          background-color: #f9f9f9;
        }
        
        .image-critique-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .header-banner {
          display: grid;
          grid-template-columns: 1fr 3fr 1fr;
          margin: 0 0 3rem;
          border: 2px solid;
          height: 180px;
          position: relative;
        }
        
        .header-left-block {
          height: 100%;
        }
        
        .header-right-block {
          height: 100%;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 2rem;
        }
        
        .category-title {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1px;
        }
        
        .category-description {
          font-size: 1.2rem;
          margin: 0.5rem 0 0;
          font-weight: 300;
        }
        
        .media-showcase {
          display: none;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .media-item {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
          border: 2px solid;
        }
        
        .media-item-0 {
          grid-column: span 2;
        }
        
        .media-item-1 {
          height: 300px;
        }
        
        .media-item-2 {
          grid-column: span 2;
        }
        
        .media-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          mix-blend-mode: color-burn;
        }
        
        .brutalist-divider {
          display: flex;
          align-items: center;
          margin: 3rem 0;
          gap: 1rem;
        }
        
        .divider-line {
          flex-grow: 1;
          height: 2px;
        }
        
        .divider-square {
          width: 20px;
          height: 20px;
          border: 2px solid;
          transform: rotate(45deg);
        }
        
        .divider-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        
        .article-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(4, minmax(150px, auto));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .article-card {
          display: flex;
          flex-direction: column;
          border: 2px solid;
          position: relative;
          transition: transform 0.2s ease;
          background-color: white;
          break-inside: avoid;
        }
        
        @media (max-width: 768px) {
          .article-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
          }
          
          .article-card {
            grid-area: auto !important;
          }
          
          .media-showcase {
            grid-template-columns: 1fr;
          }
          
          .media-item {
            grid-column: auto !important;
          }
          
          .header-banner {
            grid-template-columns: 1fr 4fr;
          }
          
          .header-right-block {
            display: none;
          }
        }
        
        .article-image {
          height: 160px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .article-number {
          position: absolute;
          bottom: 0;
          right: 0;
          background-color: white;
          padding: 0.2rem 0.5rem;
          font-weight: bold;
          font-size: 0.8rem;
          font-family: monospace;
        }
        
        .article-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        
        .article-title {
          margin: 0 0 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .article-meta {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          font-family: monospace;
        }
        
        .article-separator {
          width: 10px;
          height: 2px;
          margin: 0 0.5rem;
        }
        
        .article-preview {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          flex-grow: 1;
        }
        
        .read-more {
          display: flex;
          align-items: center;
          margin-top: 1.5rem;
          text-decoration: none;
          font-weight: bold;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        
        .read-more-text {
          margin-right: 0.5rem;
        }
        
        .read-more-line {
          height: 2px;
          width: 20px;
          transition: width 0.2s ease;
        }
        
        .read-more:hover .read-more-line {
          width: 40px;
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { articles, categories } = await getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Cartographie');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};