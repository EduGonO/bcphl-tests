
// /pages/categories/sensure.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/Header-2';
import Footer from '../../app/components/Footer';
import ReactMarkdown from 'react-markdown';

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

<a 
href={`/${categoryName}/${article.slug}`} 
className="poem-link"
aria-label={`Lire ${article.title}`}
>
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
                    
                    <div className="poem-preview"><ReactMarkdown>{article.preview}</ReactMarkdown></div>
                    
                      <span className="poem-link-text">Lire</span>
                      <span className="poem-link-icon" style={{ backgroundColor: color }}></span>
                    
                  </div>
                  
                  <div 
                    className="poem-accent" 
                    style={{ backgroundColor: color }}
                  ></div>
                </article>
                </a>
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
          background-color: #fff;
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
          font-weight: 400;
          text-transform: uppercase;
          text-align: center;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        
        .category-description {
          display: none;
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
          font-family: 'EnbyGertrude', sans-serif;
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
          margin: 0 0 0.5rem;
          line-height: 1.3;
          font-weight: 400;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        
        .poem-meta {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          font-family: monospace;
          font-weight: 400;
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
          margin-top: auto;
          width: fit-content;
        }
        
        .poem-link-text {
          margin-right: 0.5rem;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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

export const getServerSideProps: GetServerSideProps = async () => {
  const { articles, categories } = await getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Sensure');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};