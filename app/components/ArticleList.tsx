// /app/components/ArticleList.tsx
import React from 'react';
import { Article, Category } from '../../types';

interface ArticleListProps {
  articles: Article[];
  categories: Category[];
  titleFont?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  categories,
  titleFont = 'RecoletaMedium',
}) => {
  return (
    <section className="article-list">
      {articles.map((article, index) => {
        const catColor =
          categories.find((c) => c.name === article.category)?.color || '#f0f0f0';

        return (
          /* Entire row is now clickable */
          <a 
            href={`/${article.category}/${article.slug}`} 
            key={index} 
            className="list-row"
          >
            {/* Image/Thumbnail placeholder */}
            <div className="thumb" />
            
            {/* Text Content */}
            <div className="content">
              {/* Category as a headline or "LOVE LETTER" style text */}
              {/* If you'd prefer the actual category name instead, just replace it with article.category */}
              <h4 className="pre-title">{article.category.toUpperCase()}</h4>

              <h3 className="title">{article.title}</h3>
              <p className="meta">
                {article.date} • {article.author}
              </p>

              <div
                className="category-label"
                style={{
                  color: catColor,
                  borderColor: catColor,
                  backgroundColor: `${catColor}20`,
                }}
              >
                {article.category}
              </div>

              <p className="preview">{article.preview}</p>
            </div>
          </a>
        );
      })}

      <style jsx>{`
        .article-list {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .list-row {
          display: flex;
          align-items: flex-start;
          text-decoration: none;
          color: inherit;
          margin-bottom: 20px;
          padding: 8px;
          border-radius: 6px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .list-row:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .thumb {
          width: 60px;
          height: 80px;
          background-color: #e0e0e0;
          border-radius: 4px;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .content {
          flex: 1;
        }

        .pre-title {
          font-size: 14px;
          font-weight: normal;
          margin: 0 0 4px;
          color: #999;
          letter-spacing: 0.05em;
        }

        .title {
          margin: 0 0 5px;
          font-size: 18px;
          font-family: ${titleFont};
          color: #000;
          line-height: 1.3;
        }

        .meta {
          margin: 0 0 5px;
          font-size: 14px;
          color: #666;
        }

        .category-label {
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
          padding: 3px 8px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .preview {
          margin: 0;
          font-size: 14px;
          color: #444;
        }
      `}</style>
    </section>
  );
};

export default ArticleList;
