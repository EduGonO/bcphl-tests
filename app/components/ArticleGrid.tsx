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
    <section style={{ padding: '20px 0' }}>
      {/* Outer container with horizontal scroll */}
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'min-content',
          gap: '20px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '8px', // provide a bit of spacing if needed
        }}
      >
        {articles.map((article, index) => {
          const catColor = categories.find((c) => c.name === article.category)?.color || '#f0f0f0';

          return (
            <div
              key={index}
              style={{
                width: '280px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#fff',
                flexShrink: 0,
              }}
            >
              {/* Image/Thumbnail placeholder */}
              <div
                style={{
                  height: '160px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '6px 6px 0 0',
                }}
              />

              {/* Card content */}
              <div style={{ padding: '12px' }}>
                <a
                  href={`/${article.category}/${article.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3
                    style={{
                      margin: '0 0 5px',
                      fontSize: '16px',
                      fontFamily: titleFont,
                      color: '#000',
                      lineHeight: 1.3,
                    }}
                  >
                    {article.title}
                  </h3>
                </a>

                <p style={{ margin: '0 0 5px', fontSize: '13px', color: '#666' }}>
                  {article.date} • {article.author}
                </p>

                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    color: catColor,
                    border: `1px solid ${catColor}`,
                    backgroundColor: catColor + '20',
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                >
                  {article.category}
                </div>

                <p style={{ margin: '0', fontSize: '14px', color: '#444' }}>
                  {article.preview}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ArticleGrid;
