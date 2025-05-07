// /pages/categories/image-critique.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header-2';
import Footer from '../../app/components/Footer';
import ReactMarkdown from 'react-markdown';

interface ImageCritiquePageProps {
  articles: Article[];
  categories: Category[];
}

export default function ImageCritiquePage({ articles, categories }: ImageCritiquePageProps) {
  const categoryName = 'Banque des rêves';
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
            <p className="category-description">(Analyses et critiques d'images)</p>
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
                  <p className="article-preview"><ReactMarkdown>{article.preview}</ReactMarkdown></p>
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
          background-color: #fff;
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
          font-size: 2.2rem;
          font-weight: 400;
          margin: 0;
          text-transform: uppercase;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        
        .category-description {
          display: none;
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
          display: none;
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
          font-weight: 400;
          line-height: 1.2;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
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
  const { articles, categories } = getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Banque des rêves');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
}




/*
simple, no images, compact

// /pages/categories/sensure.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header-2';
import Footer from '../../app/components/Footer';

interface SensurePageProps {
  articles: Article[];
  categories: Category[];
}

export default function SensurePage({ articles, categories }: SensurePageProps) {
  const categoryName = 'Sensure';
  const config = categoryConfigMap[categoryName];
  const color = config?.color || '#000000';
  
  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  // Group articles into columns for the compact layout
  // Group articles into columns for the compact layout
const columns: Article[][] = [[], [], []];
articles.forEach((article, index) => {
  columns[index % 3].push(article);
});

  return (
    <div className="page-container" style={{ '--c': color } as React.CSSProperties}>
      <Header categories={categories} />
      
      <main className="sensure-page">
        <div className="header-container">
          <div className="header-line" style={{ backgroundColor: color }}></div>
          <h1 className="category-title">{categoryName}</h1>
          <div className="header-shapes">
            <div className="shape square" style={{ borderColor: color }}></div>
            <div className="shape triangle" style={{ borderBottomColor: color }}></div>
            <div className="shape circle" style={{ backgroundColor: color }}></div>
          </div>
          <p className="category-description">(Rubrique Sensure)</p>
          <div className="header-line" style={{ backgroundColor: color }}></div>
        </div>

        <div className="poems-grid">
          {columns.map((columnArticles, colIndex) => (
            <div key={colIndex} className="poem-column">
              {columnArticles.map((article, index) => (
                <article key={article.slug} className="poem-card">
                  <div className="poem-index" style={{ color }}>
                    {((colIndex * Math.ceil(articles.length / 3)) + index + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="poem-content">
                    <h3 className="poem-title">{article.title}</h3>
                    
                    <div className="poem-meta">
                      <span className="poem-date">{article.date}</span>
                      <span className="poem-meta-dot" style={{ backgroundColor: color }}></span>
                      <span className="poem-author">{article.author}</span>
                    </div>
                    
                    <div className="poem-preview">{article.preview}</div>
                    
                    <a 
                      href={`/${categoryName}/${article.slug}`} 
                      className="poem-link"
                      aria-label={`Lire ${article.title}`}
                    >
                      <span className="poem-link-text">Lire</span>
                      <span className="poem-link-icon" style={{ backgroundColor: color }}></span>
                    </a>
                  </div>
                  
                  <div 
                    className="poem-accent" 
                    style={{ backgroundColor: color }}
                  ></div>
                </article>
              ))}
            </div>
          ))}
        </div>
        
        <div className="brutalist-footer">
          <div className="brutalist-element" style={{ borderColor: color }}></div>
          <div className="brutalist-line" style={{ backgroundColor: color }}></div>
          <div className="brutalist-element rotated" style={{ borderColor: color }}></div>
        </div>
      </main>
      
      <Footer />

      <style jsx>{`
        .page-container {
          background-color: #f9f9f9;
          min-height: 100vh;
        }
        
        .sensure-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
        }
        

        .header-container {
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .header-line {
          height: 2px;
          width: 100%;
          margin: 1rem 0;
        }
        
        .category-title {
          font-size: 3.5rem;
          margin: 0.5rem 0;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1px;
          text-align: center;
        }
        
        .category-description {
          font-size: 1.2rem;
          margin: 0;
          font-weight: 300;
          letter-spacing: 1px;
          text-align: center;
        }
        
        .header-shapes {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 1rem 0;
        }
        
        .shape {
          transform-origin: center;
        }
        
        .square {
          width: 15px;
          height: 15px;
          border: 2px solid;
          transform: rotate(45deg);
        }
        
        .triangle {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 18px solid;
        }
        
        .circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        // Poems Grid 
        .poems-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        
        .poem-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .poem-card {
          position: relative;
          background-color: white;
          display: flex;
          padding: 0;
          font-family: 'Inter', sans-serif;
          position: relative;
          margin-left: 1.5rem;
        }
        
        .poem-index {
          position: absolute;
          left: -1.5rem;
          top: 0.75rem;
          font-family: monospace;
          font-weight: bold;
          font-size: 0.9rem;
          transform: rotate(-90deg);
          transform-origin: right top;
        }
        
        .poem-content {
          flex: 1;
          padding: 1.5rem 1.5rem 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
        }
        
        .poem-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }
        
        .poem-meta {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          font-family: monospace;
        }
        
        .poem-date, .poem-author {
          color: #555;
        }
        
        .poem-meta-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          margin: 0 0.5rem;
        }
        
        .poem-preview {
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          flex-grow: 1;
          font-style: italic;
          color: #333;
        }
        
        .poem-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #000;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: auto;
          width: fit-content;
        }
        
        .poem-link-text {
          margin-right: 0.5rem;
        }
        
        .poem-link-icon {
          width: 18px;
          height: 2px;
          position: relative;
          transition: width 0.2s ease;
        }
        
        .poem-link-icon:after {
          content: '';
          position: absolute;
          right: 0;
          top: -3px;
          width: 8px;
          height: 8px;
          border-top: 2px solid;
          border-right: 2px solid;
          border-color: inherit;
          transform: rotate(45deg);
          background-color: inherit;
        }
        
        .poem-link:hover .poem-link-icon {
          width: 25px;
        }
        
        .poem-accent {
          width: 3px;
          align-self: stretch;
        }
        
        // Brutalist Footer 
        .brutalist-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4rem;
          gap: 1rem;
        }
        
        .brutalist-element {
          width: 20px;
          height: 20px;
          border: 2px solid;
        }
        
        .brutalist-line {
          height: 2px;
          flex-grow: 1;
          max-width: 200px;
        }
        
        .rotated {
          transform: rotate(45deg);
        }
        
        // Responsive Design 
        @media (max-width: 900px) {
          .poems-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .poems-grid {
            grid-template-columns: 1fr;
          }
          
          .category-title {
            font-size: 2.5rem;
          }
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
*/