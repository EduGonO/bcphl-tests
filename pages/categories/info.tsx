// /pages/categories/image-critique.tsx
import React, { useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
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
  const categoryName = 'Image-Critique';
  const config = categoryConfigMap[categoryName];
  const color = config?.color || '#000000';
  const textContainerRef = useRef<HTMLDivElement>(null);
  
  // Effect for the text animation
  useEffect(() => {
    if (!textContainerRef.current) return;
    
    const paragraphs = textContainerRef.current.querySelectorAll('.text-fragment');
    
    // Randomize positions of text fragments
    paragraphs.forEach((p, i) => {
      const element = p as HTMLElement;
      const delay = i * 200;
      element.style.transitionDelay = `${delay}ms`;
      setTimeout(() => {
        element.classList.add('visible');
      }, 100 + delay);
    });
  }, []);

  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  // Split text into fragments for animation
  const mainText = "Dans la même urgence qu'Acéphale et portée par un désir de la contribution propre à Bernard Stiegler, la revue bicéphale défend une démarche critique tant littéraire qu'artistique et se veut radicalement hypersubjective, affectionnée et expérientielle. Elle embrasse nos multiplicités et questionne nos technicités contemporaines au risque de se faire vectrice de mouvement, de critique et de pensée.";
  
  const textFragments = mainText.split('. ').map(sentence => sentence.trim()).filter(Boolean);

  return (
    <div className="page-container" style={{ '--c': color } as React.CSSProperties}>
      <Header categories={categories} />
      <main className="image-critique-page">
        <div className="header-banner" style={{ borderColor: color }}>
          <div className="header-left-block" style={{ backgroundColor: `${color}60` }}></div>
          <div className="header-content">
            <h1 className="category-title">À propos</h1>
          </div>
          <div className="header-right-block" style={{ backgroundColor: color }}></div>
        </div>


          <div className="brutalist-divider">
            <div className="divider-line" style={{ backgroundColor: color }}></div>
            <div className="divider-square" style={{ borderColor: color }}></div>
            <div className="divider-circle" style={{ backgroundColor: `${color}60` }}></div>
            <div className="divider-line" style={{ backgroundColor: color }}></div>
          </div>

        <div className="about-content">
          <div className="brutalist-grid">
            <div className="grid-item grid-item-1">
              <div className="shape shape-1" style={{ backgroundColor: color }}></div>
            </div>
            <div className="grid-item grid-item-2">
              <div className="shape shape-2" style={{ borderColor: color }}></div>
            </div>
            <div className="grid-item grid-item-3">
              <div className="shape shape-3" style={{ backgroundColor: `${color}30` }}></div>
            </div>
            <div className="grid-item grid-item-4">
              <div className="shape shape-4" style={{ borderColor: color }}></div>
            </div>
          </div>

          <div className="text-container" ref={textContainerRef}>
            <h1 className="about-subtitle">À propos:</h1>
            {textFragments.map((fragment, index) => (
              <p key={index} className="text-fragment" style={{ 
                borderLeft: index % 2 === 0 ? `2px solid ${color}` : 'none',
                borderRight: index % 2 !== 0 ? `2px solid ${color}` : 'none'
              }}>
                {fragment}{index < textFragments.length - 1 ? '.' : ''}
              </p>
            ))}
          </div>

          <div className="glitch-container">
            <div className="glitch-text" data-text="BICÉPHALE">BICÉPHALE</div>
          </div>

          <div className="abstract-grid">
            {Array.from({ length: 9 }).map((_, index) => (
              <div 
                key={index} 
                className={`abstract-cell cell-${index}`}
                style={{ 
                  backgroundColor: index % 3 === 0 ? `${color}20` : 'transparent',
                  borderColor: index % 2 === 1 ? color : 'transparent'
                }}
              ></div>
            ))}
          </div>


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
          display: none;
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
          font-size: 1.69rem;
          margin: 0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: -1px;
          font-family: GayaRegular, -apple-system, InterRegular, sans-serif;
        }
        
        /* About Page Specific Styles */
        .about-content {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          position: relative;
          padding: 2rem 0;
        }
        
        .brutalist-grid {
          display: none;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 120px);
          gap: 2rem;
        }
        
        .grid-item {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .grid-item-1 {
          grid-column: 1 / 3;
          grid-row: 1 / 2;
        }
        
        .grid-item-2 {
          grid-column: 3 / 5;
          grid-row: 1 / 2;
        }
        
        .grid-item-3 {
          grid-column: 1 / 2;
          grid-row: 2 / 3;
        }
        
        .grid-item-4 {
          grid-column: 2 / 5;
          grid-row: 2 / 3;
        }
        
        .shape {
          position: absolute;
        }
        
        .shape-1 {
          width: 70%;
          height: 4px;
          bottom: 20%;
          left: 10%;
        }
        
        .shape-2 {
          width: 80px;
          height: 80px;
          border: 2px solid;
          border-radius: 50%;
          right: 20%;
          top: 10%;
        }
        
        .shape-3 {
          width: 100%;
          height: 100%;
          clip-path: polygon(0 0, 100% 0, 60% 100%, 0 70%);
        }
        
        .shape-4 {
          width: 60%;
          height: 2px;
          border-top: 2px solid;
          right: 10%;
        }
        
        .text-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .about-subtitle {
          font-size: 2.4rem;
          margin: 0 0 2rem;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: GayaRegular, -apple-system, InterRegular, sans-serif;
        }
        
        .text-fragment {
          font-size: 1.25rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          padding: 0.5rem 1rem;
          position: relative;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .text-fragment.visible {
          opacity: 1;
          transform: translateY(0);
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
        
        .glitch-container {
          text-align: center;
          margin: 4rem 0;
        }
        
        .glitch-text {
          font-size: 4rem;
          font-weight: 400;
          font-family: GayaRegular, InterRegular;
          text-transform: uppercase;
          letter-spacing: 0.5rem;
          position: relative;
          display: inline-block;
          color: transparent;
          -webkit-text-stroke: 1px var(--c);
          user-select: none;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          -webkit-text-stroke: 1px var(--c);
        }
        
        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 var(--c);
          animation: glitch-anim 2s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
          left: -2px;
          text-shadow: -1px 0 var(--c);
          animation: glitch-anim2 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%); }
          50% { clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%); }
          100% { clip-path: polygon(0 85%, 100% 85%, 100% 40%, 0 40%); }
        }
        
        @keyframes glitch-anim2 {
          0% { clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); }
          50% { clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); }
          100% { clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
        }
        
        .abstract-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 80px);
          gap: 1rem;
          margin: 4rem 0;
        }
        
        .abstract-cell {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .abstract-cell:hover {
          background-color: var(--c) !important;
          opacity: 0.2;
          transform: skew(-5deg);
        }
        
        @media (max-width: 768px) {
          .brutalist-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 100px);
          }
          
          .grid-item-1 {
            grid-column: 1 / 3;
            grid-row: 1 / 2;
          }
          
          .grid-item-2 {
            grid-column: 1 / 3;
            grid-row: 2 / 3;
          }
          
          .grid-item-3 {
            grid-column: 1 / 2;
            grid-row: 3 / 4;
          }
          
          .grid-item-4 {
            grid-column: 1 / 3;
            grid-row: 4 / 5;
          }
          
          .text-container {
            padding: 0;
          }
          
          .glitch-text {
            font-size: 2.5rem;
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