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
  const categoryName = 'Image-Critique';
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
            <h1 className="category-title">À propos</h1>
          </div>
          <div className="header-right-block" style={{ backgroundColor: color }}></div>
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
          font-size: 1.69rem;
          margin: 0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: -1px;
          font-family: GayaRegular, -apple-system, InterRegular, sans-serif;
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
        
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { articles, categories } = getArticleData();
  const filteredArticles = articles.filter(a => a.category === 'Image-Critique');
  
  return {
    props: { 
      articles: filteredArticles,
      categories 
    },
  };
};