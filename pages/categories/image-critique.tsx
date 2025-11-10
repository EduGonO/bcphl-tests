// /pages/categories/sensure.tsx
import React, { useEffect, useState, CSSProperties } from 'react';
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

// Function to generate contrasting accent colors based on main color
// subtler, base-hue-centric accents
// lighter-only accents
const generateAccentColors = (baseColor: string): string[] => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }

  h = Math.round(h);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  // two lighter tints + one soft analogue (also lighter)
  return [
    `hsl(${h}, ${s}%, ${Math.min(l + 15, 95)}%)`,
    `hsl(${h}, ${Math.max(s - 12, 25)}%, ${Math.min(l + 28, 97)}%)`,
    `hsl(${(h + 10) % 360}, ${Math.max(s - 18, 20)}%, ${Math.min(l + 32, 98)}%)`
  ];
};

// Function to get random geometric shape CSS
// return type React.CSSProperties
const getRandomShape = (color: string, accentColors: string[]): React.CSSProperties => {
  const variants: React.CSSProperties[] = [
    { clipPath: 'polygon(0 0,100% 0,100% 75%,0 100%)', backgroundColor: accentColors[0] },
    { clipPath: 'circle(50% at 70% 30%)',    backgroundColor: accentColors[1] },
    { clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', backgroundColor: accentColors[2] },
    { clipPath: 'polygon(0 0,100% 0,100% 100%,30% 100%)',    backgroundColor: color         },
    { clipPath: 'polygon(20% 0%,80% 0%,100% 100%,0% 100%)',  backgroundColor: accentColors[0] },
    { clipPath: 'ellipse(50% 35% at 50% 50%)',               backgroundColor: accentColors[1] },
  ];
  return variants[Math.floor(Math.random() * variants.length)];
};

export default function SensurePage({ articles, categories }: SensurePageProps) {
  const categoryName = 'Image-Critique';
  const config = categoryConfigMap[categoryName];
  const color = config?.color || '#000000';
  const [accentColors, setAccentColors] = useState<string[]>([]);
  const [shapeStyles, setShapeStyles] = useState<CSSProperties[]>([]);
  
  useEffect(() => {
    // Generate accent colors based on the main color
    const newAccentColors = generateAccentColors(color);
    setAccentColors(newAccentColors);
    
    // Generate random shape styles for each article
    const newShapeStyles = articles.map(() => getRandomShape(color, newAccentColors));
    setShapeStyles(newShapeStyles);
  }, [color, articles.length]);

  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  // Generate layout patterns for the poem cards
  const getLayoutPattern = (index: number, totalItems: number) => {
    // Create a set of Kandinsky-inspired layout patterns
    const patterns = [
      { width: 'span 2', height: 'span 2' }, // Large square
      { width: 'span 1', height: 'span 2' }, // Tall rectangle
      { width: 'span 2', height: 'span 1' }, // Wide rectangle
      { width: 'span 1', height: 'span 1' }, // Small square
      { width: 'span 3', height: 'span 1' }, // Very wide rectangle
      { width: 'span 1', height: 'span 3' }, // Very tall rectangle
    ];

    // For predictable but varied layouts
    const patternIndex = (index * 3 + Math.floor(index / 2)) % patterns.length;
    return patterns[patternIndex];
  };

  // Extract the first few lines of the poem for preview
  const extractPoemPreview = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '...' : '');
  };

  return (
    <div className="page-container">
      <Header categories={categories} />
      <main className="sensure-page">
        <div className="header-banner">
          <div className="header-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="header-content">
            <h1 className="category-title">{categoryName}</h1>
            <p className="category-description">(Rubrique Sensure)</p>
            <div className="header-line"></div>
          </div>
        </div>

        <div className="abstract-divider">
          <div className="divider-element square"></div>
          <div className="divider-element line"></div>
          <div className="divider-element circle"></div>
          <div className="divider-element triangle"></div>
          <div className="divider-element line"></div>
        </div>

        <div className="article-grid">
          {articles.map((article, index) => {
            const layout = getLayoutPattern(index, articles.length);
            
            return (
              <div 
                key={article.slug} 
                className="article-card"
                style={{ 
                  gridColumn: layout.width,
                  gridRow: layout.height
                }}
              >
                <div
                  className="card-abstract-shape"
                  style={shapeStyles[index]}
                />
                <div className="article-content">
                  <div className="article-number">{(index + 1).toString().padStart(2, '0')}</div>
                  <h3 className="article-title">{article.title}</h3>
                  <div className="article-meta">
                    <span className="article-author">{article.author}</span>
                    <span className="article-date">{article.date}</span>
                  </div>
                  <p className="article-preview"><ReactMarkdown>{article.preview}</ReactMarkdown></p>
                  <a 
                    href={`/${categoryName}/${article.slug}`} 
                    className="read-more"
                  >
                    <span className="read-more-text">Lire la suite</span>
                    <span className="read-more-arrow">→</span>
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
          --primary: ${color};
          --accent1: ${accentColors[0] || '#ccc'};
          --accent2: ${accentColors[1] || '#666'};
          --accent3: ${accentColors[2] || '#999'};
        }
        
        .sensure-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
        }
        
        .header-banner {
          position: relative;
          height: 300px;
          margin: 0 0 5rem;
          overflow: hidden;
          border: 3px solid var(--primary);
        }
        
        .header-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        
        .shape {
          position: absolute;
        }
        
        .shape-1 {
          width: 150px;
          height: 150px;
          top: -30px;
          left: 10%;
          background-color: var(--accent1);
          transform: rotate(15deg);
        }
        
        .shape-2 {
          width: 120px;
          height: 120px;
          bottom: -40px;
          right: 15%;
          border-radius: 50%;
          background-color: var(--accent2);
        }
        
        .shape-3 {
          width: 200px;
          height: 200px;
          top: 20px;
          right: -50px;
          background-color: var(--accent3);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        
        .header-content {
          position: relative;
          z-index: 2;
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
        }
        
        .category-title {
          font-size: 2.2rem;
          margin: 0;
          font-weight: 400;
          text-transform: uppercase;
          line-height: 0.9;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        
        .category-description {
          display: none;
          font-size: 1.5rem;
          margin: 1rem 0 0;
          font-weight: 300;
          letter-spacing: 1px;
        }
        
        .header-line {
          width: 120px;
          height: 8px;
          background-color: var(--primary);
          margin-top: 2rem;
        }
        
        .abstract-divider {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 3rem 0 5rem;
          padding: 0 15%;
        }
        
        .divider-element {
          background-color: var(--primary);
        }
        
        .divider-element.line {
          flex-grow: 1;
          height: 3px;
          margin: 0 1rem;
        }
        
        .divider-element.square {
          width: 20px;
          height: 20px;
        }
        
        .divider-element.circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        
        .divider-element.triangle {
          width: 20px;
          height: 20px;
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        }
        
        .article-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(200px, auto);
          gap: 2rem;
          margin-bottom: 5rem;
        }
        
        .article-card {
          position: relative;
          overflow: hidden;
          border: 3px solid var(--primary);
          background-color: white;
          transition: transform 0.3s ease;
        }
        
        .article-card:hover {
          transform: translateY(-5px);
        }
        
        .card-abstract-shape {
          position: absolute;
          width: 60%;
          height: 60%;
          top: -10%;
          right: -10%;
          z-index: 1;
          opacity: 0.7;
          mix-blend-mode: multiply;
          transition: transform 0.5s ease;
        }
        
        .article-card:hover .card-abstract-shape {
          transform: scale(1.1) rotate(5deg);
        }
        
        .article-content {
          position: relative;
          z-index: 2;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .article-number {
          font-size: 1rem;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .article-title {
          margin: 0 0 1rem;
          font-size: 1.8rem;
          font-weight: 400;
          line-height: 1.2;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }
        
        .article-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          font-family: 'Courier New', monospace;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
          padding: 0.5rem 0;
        }
        
        .article-preview {
          margin: 0;
          font-size: 1rem;
          line-height: 1.6;
          flex-grow: 1;
          white-space: pre-line;
        }
        
        .read-more {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
          text-decoration: none;
          font-weight: bold;
          font-size: 0.9rem;
          text-transform: uppercase;
          color: var(--primary);
          border: 2px solid var(--primary);
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        
        .read-more:hover {
          background-color: var(--primary);
          color: white;
        }
        
        .read-more-arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }
        
        .read-more:hover .read-more-arrow {
          transform: translateX(5px);
        }
        
        .abstract-composition {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(2, 80px);
          gap: 1rem;
          margin-top: 5rem;
        }
        
        .composition-element {
          grid-column: span 2;
          grid-row: span 1;
        }
        
        .element-1 {
          grid-column: 1 / span 3;
          grid-row: 1 / span 2;
        }
        
        .element-2 {
          grid-column: 4 / span 1;
          grid-row: 1 / span 1;
        }
        
        .element-3 {
          grid-column: 5 / span 2;
          grid-row: 1 / span 1;
        }
        
        @media (max-width: 1024px) {
          .article-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .category-title {
            font-size: 4rem;
          }
        }
        
        @media (max-width: 768px) {
          .article-grid {
            grid-template-columns: 1fr;
          }
          
          .article-card {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          
          .category-title {
            font-size: 3rem;
          }
          
          .abstract-composition {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 60px);
          }
          
          .composition-element {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          
          .element-1 {
            grid-column: 1 / span 2 !important;
          }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { articles, categories } = await getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Image-Critique');

  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};