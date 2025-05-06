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
  const color = config?.color || '#000000';
  
  // Prepare header images mapping
  const headerImages: Record<string, string> = {};
  articles.forEach(article => {
    if (article.headerImage) {
      headerImages[article.slug] = article.headerImage;
    }
  });
  
  if (!config) {
    return <div>Catégorie (shared) introuvable.</div>;
  }

  return (
    <div className="category-container">
      <div className="category-page">
        {/* Abstract geometric header inspired by Kandinsky */}
        <div className="category-header">
          <div className="geometric-element elem-1" style={{ backgroundColor: `${color}90` }}></div>
          <div className="geometric-element elem-2" style={{ borderColor: color }}></div>
          <div className="geometric-element elem-3" style={{ backgroundColor: color }}></div>
          
          <div className="header-content">
            <h1 className="category-title">{category}</h1>
            <div className="title-underline" style={{ backgroundColor: color }}></div>
          </div>
        </div>
        
        {/* Media showcase with geometric arrangement */}
        {config.media.length > 0 && (
          <div className="category-media">
            {config.media.map((src, i) => (
              <div 
                key={i} 
                className={`media-item media-pos-${i % 4}`}
                style={{ 
                  backgroundImage: `url(${src})`,
                  borderColor: color
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Source information */}
        {config.dataFolder && (
          <div className="category-info">
            <div className="info-marker" style={{ backgroundColor: color }}></div>
            <p className="source-info">
              Source: articles/{category}
            </p>
          </div>
        )}
        
        {/* Article grid with Kandinsky-inspired layout */}
        <div className="article-grid">
          {articles.length > 0 ? (
            articles.map((article, index) => {
              const imgStyle = headerImages[article.slug] 
                ? { backgroundImage: `url(${headerImages[article.slug]})` } 
                : { backgroundColor: `${color}20` };
                
              return (
                <div 
                  key={article.slug} 
                  className={`article-item article-${index % 3}`}
                >
                  <div className="article-image" style={imgStyle}>
                    <div className="article-index">{(index + 1).toString().padStart(2, '0')}</div>
                  </div>
                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <div className="article-meta">
                      <span className="meta-date">{article.date}</span>
                      <span className="meta-dot" style={{ backgroundColor: color }}></span>
                      <span className="meta-author">{article.author}</span>
                    </div>
                    <p className="article-preview">{article.preview}</p>
                    <a 
                      href={`/${category}/${article.slug}`}
                      className="article-link"
                      style={{ color }}
                    >
                      <span className="link-text">Lire</span>
                      <span className="link-icon" style={{ borderColor: color }}></span>
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-articles">Aucun article trouvé dans cette catégorie.</p>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .category-container {
          background-color: #fafafa;
          min-height: 100vh;
        }
        
        .category-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        /* Abstract geometric header */
        .category-header {
          position: relative;
          height: 140px;
          margin-bottom: 2.5rem;
          overflow: hidden;
          border-bottom: 1px solid #eee;
        }
        
        .geometric-element {
          position: absolute;
        }
        
        .elem-1 {
          width: 120px;
          height: 120px;
          right: 5%;
          top: 10px;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        
        .elem-2 {
          width: 80px;
          height: 80px;
          right: 20%;
          top: 30px;
          border: 2px solid;
          border-radius: 0 50% 50% 50%;
          transform: rotate(45deg);
        }
        
        .elem-3 {
          width: 30px;
          height: 30px;
          left: 25%;
          bottom: 20px;
          border-radius: 50%;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          padding-top: 40px;
        }
        
        .category-title {
          font-size: 2.8rem;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -1px;
        }
        
        .title-underline {
          width: 60px;
          height: 4px;
          margin-top: 8px;
        }
        
        /* Media showcase */
        .category-media {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 120px);
          gap: 12px;
          margin-bottom: 2rem;
        }
        
        .media-item {
          background-size: cover;
          background-position: center;
          border-left: 3px solid;
        }
        
        .media-pos-0 {
          grid-column: span 2;
          grid-row: span 2;
        }
        
        .media-pos-1 {
          grid-column: 3;
          grid-row: 1;
        }
        
        .media-pos-2 {
          grid-column: 4;
          grid-row: 1;
        }
        
        .media-pos-3 {
          grid-column: 3 / span 2;
          grid-row: 2;
        }
        
        /* Source information */
        .category-info {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .info-marker {
          width: 10px;
          height: 10px;
          margin-right: 10px;
        }
        
        .source-info {
          font-style: italic;
          color: #555;
          margin: 0;
          font-size: 0.9rem;
        }
        
        /* Article grid */
        .article-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .article-item {
          background-color: white;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #eaeaea;
          border-bottom: 1px solid #eaeaea;
          position: relative;
        }
        
        .article-0 {
          border-left: 3px solid ${color};
        }
        
        .article-1 {
          border-top: 3px solid ${color};
        }
        
        .article-2 {
          border-right: 3px solid ${color};
        }
        
        .article-image {
          height: 120px;
          position: relative;
        }
        
        .article-index {
          position: absolute;
          top: 0;
          right: 0;
          background-color: white;
          padding: 4px 8px;
          font-size: 0.8rem;
          font-weight: bold;
          font-family: monospace;
        }
        
        .article-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        
        .article-title {
          margin: 0 0 6px;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.3;
        }
        
        .article-subtitle {
          font-size: 0.8rem;
          color: #555;
          margin-bottom: 8px;
          font-style: italic;
        }
        
        .article-meta {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.85rem;
          color: #666;
        }
        
        .meta-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          margin: 0 8px;
        }
        
        .article-preview {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #333;
          flex-grow: 1;
        }
        
        .article-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          margin-top: 16px;
          align-self: flex-start;
        }
        
        .link-text {
          margin-right: 6px;
        }
        
        .link-icon {
          width: 8px;
          height: 8px;
          border-width: 0 2px 2px 0;
          transform: rotate(-45deg);
          display: inline-block;
        }
        
        .no-articles {
          grid-column: 1 / -1;
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .category-media {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(3, 100px);
          }
          
          .media-pos-0 {
            grid-column: span 2;
            grid-row: 1;
          }
          
          .media-pos-1 {
            grid-column: 1;
            grid-row: 2;
          }
          
          .media-pos-2 {
            grid-column: 2;
            grid-row: 2;
          }
          
          .media-pos-3 {
            grid-column: span 2;
            grid-row: 3;
          }
          
          .category-title {
            font-size: 2rem;
          }
          
          .elem-1 {
            width: 80px;
            height: 80px;
          }
          
          .elem-2 {
            width: 50px;
            height: 50px;
          }
        }
        
        @media (max-width: 480px) {
          .article-grid {
            display: block;
          }
          
          .article-item {
            margin-bottom: 20px;
          }
          
          .category-header {
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}