// /app/components/ArticleGrid.tsx
import React from 'react';
import { Article, Category } from '../../types';
import Image from 'next/image';

interface ArticleGridProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  categories,
  titleFont = 'GayaRegular',
}) => {
  return (
    <section className="article-grid">
      <div className="grid-container">
        {articles.map((article, index) => {
          const catColor =
            categories.find((c) => c.name === article.category)?.color || '#f0f0f0';

          return (
            <a
              href={`/${article.category}/${article.slug}`}
              key={index}
              className="card-link"
            >
              <div className="card">
                <div className="card-image">
                  {article.imageUrl && (
                    <div className="image-wrapper">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="article-image"
                      />
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <div
                    className="card-category"
                    style={{
                      color: catColor,
                      border: `1px solid ${catColor}`,
                      backgroundColor: catColor + '10',
                    }}
                  >
                    {article.category}
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                  <p className="card-preview">{article.preview}</p>
                  <p className="card-meta">
                    <span className="author">{article.author}</span>
                    <span className="date-separator">•</span>
                    <span className="date">{article.date}</span>
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <style jsx>{`
        .article-grid {
          margin: 2rem 0;
          width: 100%;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
          padding: 0 20px;
          
          @media (min-width: 768px) {
            grid-auto-flow: initial;
            grid-auto-columns: initial;
            overflow-x: visible;
          }
          
          @media (max-width: 767px) {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 1.5rem;
          }
        }
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          
          @media (max-width: 767px) {
            flex: 0 0 300px;
            scroll-snap-align: start;
          }
        }
        .card {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.2s ease;
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid #e2e2e2;
        }
        .card:hover {
          transform: translateY(-4px);
        }
        .card-image {
          position: relative;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          overflow: hidden;
          background: #f7f7f7;
        }
        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .article-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .card:hover .article-image {
          transform: scale(1.05);
        }
        .card-content {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .card-title {
          margin: 12px 0;
          font-size: 20px;
          font-family: ${titleFont}, serif;
          font-weight: 600;
          line-height: 1.3;
          color: #121212;
          letter-spacing: -0.01em;
        }
        .card-preview {
          margin: 0 0 16px;
          font-size: 15px;
          line-height: 1.5;
          color: #444;
          flex-grow: 1;
          font-family: 'Georgia', serif;
        }
        .card-meta {
          margin: 0;
          font-size: 13px;
          color: #666;
          display: flex;
          align-items: center;
        }
        .author {
          font-weight: 500;
        }
        .date-separator {
          margin: 0 6px;
          opacity: 0.6;
        }
        .card-category {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
          letter-spacing: 0.5px;
          align-self: flex-start;
        }
      `}</style>
    </section>
  );
};

export default ArticleGrid;