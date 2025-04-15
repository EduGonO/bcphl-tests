// /app/components/ArticleGrid.tsx
import React from 'react';
import { Article, Category } from '../../types';

interface ArticleGridProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  categories,
  titleFont = 'RecoletaMedium',
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
                <div className="card-image" />
                <div className="card-content">
                  <h3 className="card-title">{article.title}</h3>
                  <p className="card-meta">
                    {article.date} • {article.author}
                  </p>
                  <div
                    className="card-category"
                    style={{
                      color: catColor,
                      border: `1px solid ${catColor}`,
                      backgroundColor: catColor + '20',
                    }}
                  >
                    {article.category}
                  </div>
                  <p className="card-preview">{article.preview}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      <style jsx>{`
        .grid-container {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: min-content;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 0px 20px;
        }
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .card {
          width: 280px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .card-image {
          height: 160px;
          background: #e0e0e0;
        }
        .card-content {
          padding: 12px;
        }
        .card-title {
          margin: 0 0 5px;
          font-size: 16px;
          font-family: ${titleFont};
          line-height: 1.3;
          color: #000;
        }
        .card-meta {
          margin: 0 0 5px;
          font-size: 13px;
          color: #666;
        }
        .card-category {
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .card-preview {
          margin: 0;
          font-size: 14px;
          color: #444;
        }
      `}</style>
    </section>
  );
};

export default ArticleGrid;
